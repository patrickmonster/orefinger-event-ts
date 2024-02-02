import axios from 'axios';
import { insertEvents, selectEventBats } from 'controllers/bat';
import { NoticeChannel } from 'interfaces/notice';
import { parseString } from 'xml2js';

/**
 * xml 형태의 데이터를 embed 형태로 변환합니다
 * @param video_object
 * @returns
 */
const convertVideoObject = (video_object: any) => {
    const {
        'media:group': [
            {
                'media:title': [title],
                'media:content': [{ $: content }],
                'media:thumbnail': [{ $: thumbnail }],
            },
        ],
    } = video_object;

    return {
        title,
        url: content.url,
        image: { ...thumbnail },
        thumbnail: {
            url: 'https://cdn.discordapp.com/attachments/682449668428529743/1125234663045201950/yt_icon_rgb.png',
        },
    };
};

const getChannelVideos = async (notice_id: number, hash_id: string) =>
    new Promise<{
        videos: any[];
        channel_title: string;
    }>((resolve, reject) => {
        axios
            .get(`https://www.youtube.com/feeds/videos.xml?channel_id=${hash_id}`)
            .then(({ data }) => {
                parseString(
                    data,
                    async (
                        err,
                        {
                            feed: {
                                title: [channel_title],
                                entry,
                            },
                        }
                    ) => {
                        if (err) return reject(err);
                        // entry.map(convertVideoObject)
                        const videos = [];

                        for (const video_object of entry) {
                            const {
                                id: [id],
                                'media:group': [
                                    {
                                        'media:title': [title],
                                    },
                                ],
                            } = video_object;
                            try {
                                await insertEvents(notice_id, id, title);
                                videos.push(convertVideoObject(video_object));
                            } catch (e) {
                                continue;
                            }
                        }
                        resolve({ videos, channel_title });
                    }
                );
            })
            .catch(reject);
    });

/**
 * 각 채널 별로 메세지를 전송합니다
 * @param channels
 * @param message TODO : message 객체
 */
const sendChannels = async (channels: NoticeChannel[], message: any) => {
    for (const { notice_id, guild_id, channel_id, use_yn, update_at } of channels) {
        //
    }
};

setInterval(async () => {
    let pageIndex = 0;
    do {
        const { list, totalPage } = await selectEventBats(2, {
            page: pageIndex,
            limit: 100,
        });

        for (const { channels, notice_id, hash_id, message, name, img_idx } of list) {
            try {
                const { videos, channel_title } = await getChannelVideos(notice_id, hash_id);
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
            } catch (e) {
                console.log('Error: ', hash_id);
                continue;
            }

            // try {
            //     await QUERY(`INSERT INTO discord.event_video (video_id, channel_id, title) VALUES(?)`, [id, user_id, title]);
            //     for (const { url, ment } of channels) {
            //         send(url, {
            //             content: ment.replace('{TITLE}', title),
            //             embeds: [embed],
            //         }).catch(e => {
            //             if (e.code == 404 && e.response?.data?.code === 10003) {
            //                 QUERY(`UPDATE event_channel SET delete_yn = 'Y' WHERE channel_id = ?`, channel_id).catch(e => {});
            //                 return;
            //             }
            //         });
            //     }
            // } catch (e) {
            //     continue;
            // }
        }

        if (list.length === 0 || pageIndex >= totalPage) break;
        pageIndex++;
    } while (true);

    console.log('탐색 :: Youtube', new Date(), pageIndex);
}, 1000 * 60 * 5); // 5분마다 실행
