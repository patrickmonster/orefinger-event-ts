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

import { Content } from 'interfaces/API/Chzzk';
import { NoticeBat } from 'interfaces/notice';
import { BaseTask } from 'utils/baseTask';
import { getChzzkAPI } from 'utils/naverApiInstance';

const chzzkV2 = getChzzkAPI('v2');

let count = 0;

let bootTime = Date.now();

const task = new BaseTask({ targetEvent: 4, timmer: 100, loopTime: 300 }).on('scan', async (item: NoticeBat) => {
    const { channels, notice_id: noticeId, hash_id: hashId, message, name, id } = item;
    await chzzkV2
        .get<{ content: Content }>(`channels/${hashId}/live-detail`, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        })
        .then(async ({ content }) => {
            // 콘텐츠의 라이브 id 가 없거나, 라이브 id 가 같으면 무시
            const time = Date.now() - bootTime;
            console.log(count++, `${Math.floor(time / 1000)} (${time}ms)`, noticeId, content.liveId, id);
        })
        .catch(e => {
            if (e.response) {
                if (e?.response?.data && e.response.data?.code === 403) {
                    console.log('서비스 차단', e);
                }
            }
        });

    bootTime = Date.now();
});

task.start();
