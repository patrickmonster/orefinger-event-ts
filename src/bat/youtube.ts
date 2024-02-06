import axios from 'axios';
import { insertVideoEvents, selectEventBats, selectVideoEvents } from 'controllers/bat';
import { deleteNoticeChannel } from 'controllers/notice';
import { NoticeChannel } from 'interfaces/notice';
import discord from 'utils/discordApiInstance';
import sleep from 'utils/sleep';
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

/**
 * 채널의 비디오 목록을 가져옵니다
 * @param notice_id
 * @param hash_id
 * @returns
 */
const getChannelVideos = async (notice_id: number, hash_id: string) =>
    new Promise<{
        videos: any[];
        channel_title: string;
    }>((resolve, reject) => {
        axios
            .get(`https://www.youtube.com/feeds/videos.xml?channel_id=${hash_id}`)
            .then(({ data }) => {
                parseString(data, async (err, data) => {
                    if (err) return reject(err);
                    const {
                        feed: {
                            title: [channel_title],
                            entry,
                        },
                    } = data;

                    const oldVideos = await selectVideoEvents(notice_id);

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
                        // 이미 등록된 비디오는 건너뜁니다 (중복 방지)
                        if (oldVideos.find(v => v.video_id === id)) continue;

                        try {
                            await insertVideoEvents(notice_id, id, title);
                            videos.push(convertVideoObject(video_object));
                        } catch (e) {
                            continue;
                        }
                    }
                    resolve({ videos, channel_title });
                });
            })
            .catch(reject);
    });

/**
 * 각 채널 별로 메세지를 전송합니다
 * @param channels
 * @param message TODO : message 객체
 */
const sendChannels = async (channels: NoticeChannel[], message: any) => {
    for (const { notice_id, channel_id } of channels) {
        console.log('sendChannels', notice_id, channel_id);
        discord.post(`/channels/${channel_id}/messages`, message).catch(() => {
            deleteNoticeChannel(notice_id, channel_id).catch(e => {
                console.log('Error: ', e);
            });
        });
    }
};

// 5분마다 실행되는 함수
const interval = async () => {
    const random = Math.floor(Math.random() * 100); // Random delay
    let pageIndex = 0;
    do {
        console.log('탐색 :: Youtube', new Date(), pageIndex);
        const { list, totalPage } = await selectEventBats(2, {
            page: pageIndex,
            limit: 10,
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
        }

        if (list.length === 0 || pageIndex >= totalPage) break;
        pageIndex++;
        await sleep(100 * random); // Cull down the request
    } while (true);

    console.log('탐색 :: Youtube', new Date(), pageIndex);
};

setInterval(interval, 1000 * 60 * 5); // 5분마다 실행
console.log('Youtube Batch Start!');
