import { config } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';
import { env } from 'process';
const envDir = join(env.PWD || __dirname, `/.env`);
if (existsSync(envDir)) {
    config({ path: envDir });
} else {
    // 로컬버전 - 운영 환경에서는 빌드시 자동으로 .env 파일을 생성함.
    config({
        path: join(env.PWD || __dirname, `/src/env/.env.${env.NODE_ENV}`),
    });
}

import { convertVideoObject } from 'components/user/chzzk';
import { Content } from 'interfaces/API/Chzzk';
import { NoticeBat } from 'interfaces/notice';
import { BaseTask } from 'utils/baseTask';
import discord from 'utils/discordApiInstance';
import { getChzzkAPI } from 'utils/naverApiInstance';

const chzzkV2 = getChzzkAPI('v2');

let count = 0;

let bootTime = Date.now();

const task = new BaseTask({ targetEvent: 4, timmer: 100, loopTime: 500 }).on('scan', async (item: NoticeBat) => {
    const { hash_id: hashId } = item;
    await chzzkV2
        .get<{ content: Content }>(`channels/${hashId}/live-detail`, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        })
        .then(async ({ content }) => {
            // 콘텐츠의 라이브 id 가 없거나, 라이브 id 가 같으면 무시
            // https://discord.com/api
            if (content && content.status === 'OPEN')
                await discord
                    .post(
                        `/webhooks/1246986939949907989/5baTv1G6S6rQHJwvWlosUrjX_x-JleMfswtyTkI-G8XbNhpJYPdTqxUpldH0Zrx0LgRD`,
                        {
                            body: {
                                content: '테스트',
                                embeds: [convertVideoObject(content, hashId)],
                                username: content.channel?.channelName || '방송알리미',
                                avatar_url:
                                    content.channel.channelImageUrl ||
                                    'https://cdn.orefinger.click/post/466950273928134666/d2d0cc31-a00e-414a-aee9-60b2227ce42c.png',
                            },
                        }
                    )
                    .catch(e => {
                        console.error('discord error', e);
                    });
        })
        .catch(e => {
            if (e.response) {
                if (e?.response?.data && e.response.data?.code === 403) {
                    console.log('서비스 차단', e);
                }
            }
        });
});

task.start();
