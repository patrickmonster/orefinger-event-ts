import axios from 'axios';

import { getLiveMessage as afreeca } from 'components/afreecaUser';
import { getLiveMessage as chzzk } from 'components/chzzkUser';
import { getVod, getChannelVideos as laftel } from 'components/laftelUser';
import { sendChannels } from 'components/notice';
import { getChannelVideos as youtube } from 'components/youtubeUser';
import { ecsSet } from 'controllers/log';
import { deleteNotice } from 'controllers/notice';
import { ECStask } from 'interfaces/ecs';
import { NoticeBat } from 'interfaces/notice';
import { BaseTask } from 'utils/baseTask';
import { openApi } from 'utils/discordApiInstance';
import { error as errorLog } from './utils/logger';

const tasks = {
    youtube: new BaseTask({ targetEvent: 2, timmer: 1000 * 60 * 3 }).on(
        'scan',
        async ({ channels, notice_id, hash_id, message, name }: NoticeBat) => {
            try {
                const { videos, channel_title } = await youtube(notice_id, hash_id);
                for (const video of videos) {
                    sendChannels(channels, {
                        content: message,
                        embeds: [
                            {
                                ...video,
                                author: {
                                    name: name || channel_title,
                                    url: `https://www.youtube.com/channel/${hash_id}`,
                                },
                            },
                        ],
                    });
                } // for
            } catch (e) {}
        }
    ),
    laftel: new BaseTask({ targetEvent: 7, timmer: 1000 * 60 * 20 }).on(
        'scan',
        async ({ channels, notice_id, hash_id, message, name }: NoticeBat) => {
            const vodList = await getVod();
            const ids = vodList.map(v => `${v.id}`);
            if (!ids.includes(hash_id)) {
                // 종료된 알림 (더이상 방송하지 않는 경우)
                console.log('종료된 알림', hash_id);

                sendChannels(channels, {
                    embeds: [
                        {
                            title: '방송 종료',
                            description: `
${name} - 방영이 종료되었습니다
[방송 다시보기](https://laftel.net/item/${hash_id})

* 해당 알림은 비활성화 됩니다.
                            `,
                            author: {
                                name,
                                url: `https://laftel.net/item/${hash_id}`,
                            },
                        },
                    ],
                });

                await deleteNotice(notice_id);
                return;
            }
            try {
                const videos = await laftel(notice_id, hash_id);
                for (const video of videos) {
                    sendChannels(channels, {
                        content: message,
                        embeds: [
                            {
                                ...video,
                                author: {
                                    name,
                                    url: `https://laftel.net/item/${hash_id}`,
                                },
                            },
                        ],
                    });
                }
            } catch (e) {}
        }
    ),
    afreeca: new BaseTask({ targetEvent: 5, timmer: 100 }).on('scan', async (item: NoticeBat) => {
        try {
            await afreeca(item);
        } catch (e) {}
    }),
    chzzk: new BaseTask({ targetEvent: 4, timmer: 100 }).on('scan', async (item: NoticeBat) => {
        try {
            await chzzk(item);
        } catch (e: any) {
            if (e) {
                // 서비스 차단
                console.error('서비스 차단', e);
                if (e.response) {
                    openApi.post(`${process.env.WEB_HOOK_URL}`, {
                        embeds: [
                            {
                                title: '서비스 차단 으로 인한 스캔 거부',
                                description: `
task : ${item.notice_id}
hash : ${item.hash_id}
message : ${e?.response?.data ? JSON.stringify(e.response.data) : ''}
                                `,
                                color: 0xff0000,
                            },
                        ],
                    });
                }
            }
        }
    }),
};

// GET ecs state
if (process.env.ECS_CONTAINER_METADATA_URI) {
    const { ECS_CONTAINER_METADATA_URI } = process.env;
    console.log(`ECS: ${ECS_CONTAINER_METADATA_URI}`);
    axios
        .get<ECStask>(`${ECS_CONTAINER_METADATA_URI}/task`)
        .then(async ({ data }) => {
            const { Family, Revision, TaskARN } = data;
            const [, name, id] = TaskARN.split('/');

            console.log(`ECS STATE ::`, data.Containers);
            process.env.ECS_ID = id;
            process.env.ECS_REVISION = Revision;
            process.env.ECS_FAMILY = Family;

            const { insertId } = await ecsSet(id, Revision, Family);

            console.log(`ECS SET ::`, insertId);

            for (const task of Object.values(tasks)) {
                task.on('log', (...args) => console.log(`[${name}]`, ...args));
                task.on('error', (...args) => console.error(`[${name}]`, ...args));

                task.changeTaskCount(Revision, insertId);
                task.start();
            }
        })
        .catch(e => {
            console.error(`ECS STATE ERROR ::`, e);
        });
} else {
    console.log('ECS_CONTAINER_METADATA_URI is not defined');

    for (const task of Object.values(tasks)) {
        task.on('log', console.log);
        task.on('error', console.error);

        task.start();
    }
}

process.on('unhandledRejection', (err, promise) => {
    errorLog('unhandledRejection', JSON.stringify(err, Object.getOwnPropertyNames(err)));
    console.error('unhandledRejection', err);
});
process.on('uncaughtException', (err, promise) => {
    errorLog('uncaughtException', JSON.stringify(err, Object.getOwnPropertyNames(err)));
    console.error('uncaughtException', err);
});

process.on('SIGINT', function () {
    console.error(`=============================${process.pid}번 프로세서가 종료됨=============================`);
    process.exit();
});
