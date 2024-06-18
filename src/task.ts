import { deleteNotice } from 'controllers/notice';
import { NoticeBat } from 'interfaces/notice';

import { BaseTask } from 'utils/baseTask';
import { openApi } from 'utils/discordApiInstance';

import 'utils/procesTuning';

import { sendChannels, sendMessageByChannels } from 'components/notice';
import { addEvent, isInit } from 'components/socket/socketClient';
import { getLiveMessage as afreeca } from 'components/user/afreeca';
import { getLiveMessage as chzzk } from 'components/user/chzzk';
import { getVod, getChannelVideos as laftel } from 'components/user/laftel';
import { getChannelVideos as youtube } from 'components/user/youtube';

import { ParseInt } from 'utils/object';

/**
 * 알림 작업 스레드 입니다.
 * @description 알림 작업을 수행하는 스레드로써, 각 알림 스캔 작업을 수행합니다.
 */
const tasks = {
    youtube: new BaseTask({ targetEvent: 2, timmer: 1000 * 60, loopTime: 2 * 1000 }).on(
        'scan',
        async ({ channels, notice_id, hash_id, message, name }: NoticeBat) => {
            try {
                const { videos, channel_title } = await youtube(notice_id, hash_id);
                for (const video of videos) {
                    sendMessageByChannels(
                        channels.map(channel => ({
                            ...channel,
                            message: {
                                content: message,
                                username: channel_title || '방송알리미',
                                embeds: [
                                    {
                                        ...video,
                                        author: {
                                            name: name || channel_title,
                                            url: `https://www.youtube.com/channel/${hash_id}`,
                                        },
                                    },
                                ],
                            },
                        }))
                    );
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
    chzzk: new BaseTask({ targetEvent: 4, timmer: 100, loopTime: 300 }).on('scan', async (item: NoticeBat) => {
        try {
            const liveStatus = await chzzk(item);

            if (liveStatus) {
                process.send?.({
                    type: 'liveCangeChzzk',
                    data: {
                        liveStatus,
                    },
                });
            }
        } catch (e: any) {
            if (e) {
                // 서비스 차단
                console.error('서비스 차단', e);

                if (e.response) {
                    if (e?.response?.data && e.response.data?.code === 403) {
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
        }
    }),
};

if (isInit())
    addEvent('requestInit', data => {
        console.log('TASK INIT :: ', data);

        const { id, revision, family, pk } = data;

        process.env.ECS_ID = id;
        process.env.ECS_REVISION = revision;
        process.env.ECS_FAMILY = family;
        process.env.ECS_PK = pk;

        for (const task of Object.values(tasks)) {
            task.changeTaskCount(`${process.env.ECS_REVISION}`, ParseInt(`${process.env.ECS_PK}`));
            task.start();
        }
    });
else {
    for (const task of Object.values(tasks)) {
        task.changeTaskCount(`${process.env.ECS_REVISION}`, ParseInt(`${process.env.ECS_PK}`));
        task.start();
    }
}
