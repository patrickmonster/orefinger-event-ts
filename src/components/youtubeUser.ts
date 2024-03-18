import axios from 'axios';
import { upsertNotice } from 'controllers/notice';
import redis, { REDIS_KEY } from 'utils/redis';

import { insertVideoEvents, selectVideoEvents } from 'controllers/bat';
import qs from 'querystring';
import { parseString } from 'xml2js';

interface ChannelData {
    kind: string;
    etag: string;
    id: {
        kind: string;
        channelId: string;
    };
    snippet: {
        channelId: string;
        title: string;
        description: string;
        publishedAt: string;
        thumbnails: {
            default: {
                url: string;
                width: number;
                height: number;
            };
            medium: {
                url: string;
                width: number;
                height: number;
            };
            high: {
                url: string;
                width: number;
                height: number;
            };
        };
    };
}

export const getYoutubeUser = async (youtubeHash: string): Promise<number> => {
    const { data } = await axios.get(`https://www.youtube.com/feeds/videos.xml?channel_id=${youtubeHash}`);
    return new Promise((resolve, reject) => {
        parseString(data, async (err, { feed }) => {
            console.log('?', feed, err);

            if (err) {
                return reject(err);
            }

            const {
                author: [
                    {
                        name: [name],
                    },
                ],
            } = feed;

            try {
                const noticeId = await upsertNotice(
                    {
                        hash_id: youtubeHash,
                        notice_type: 2,
                        message: '|| @everyone || New Video! 🎬',
                        name: name,
                    },
                    true
                );

                resolve(noticeId);
            } catch (e) {
                console.log('e', e);

                reject(e);
            }
        });
    });
};

/**
 * 사용자 검색
 * @param keyword 검색어
 * @returns Array<{ name: string; value: string }>
 */
export const searchYoutubeUser = async (keyword: string): Promise<Array<{ name: string; value: string }>> => {
    if (`${keyword}`.length < 2) return [];

    const redisKey = REDIS_KEY.API.SEARCH_USER(`youtube:${keyword}`);

    try {
        const data = await redis.get(redisKey);
        if (data) {
            return JSON.parse(data);
        } else {
            throw new Error('no data');
        }
    } catch (e) {
        const {
            data: { items },
        } = await axios.get<{
            items: Array<ChannelData>;
        }>(
            `https://www.googleapis.com/youtube/v3/search?${qs.stringify({
                part: 'snippet',
                q: `${keyword}`,
                type: 'channel',
                maxResults: 15,
                key: process.env.YOUTUBE_API_KEY,
            })}`
        );

        const result = items.map(({ snippet: { channelId, title } }): { name: string; value: string } => ({
            name: title,
            value: channelId,
        }));

        if (result)
            await redis.set(redisKey, JSON.stringify(result), {
                EX: 60 * 60 * 24,
            });

        return result || [];

        // const {
        //     content: { data },
        // } = await chzzk.get<
        //     ChzzkInterface<{
        //         size: number;
        //         page?: {
        //             next: {
        //                 offset: number;
        //             };
        //         };
        //         data: Array<{
        //             live: any;
        //             channel: ChannelData;
        //         }>;
        //     }>
        // >(
        //     `/search/channels?${qs.stringify({
        //         keyword: `${keyword}`,
        //         offset: 0,
        //         size: 12,
        //     })}`,
        //     {
        //         headers: {
        //             'Content-Type': 'application/json',
        //             'User-Agent':
        //                 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        //         },
        //     }
        // );

        // const result = data.map(
        //     ({ channel: { channelId, channelName, verifiedMark } }): { name: string; value: string } => ({
        //         name: `${verifiedMark ? '인증됨]' : ''}${channelName}`,
        //         value: channelId,
        //     })
        // );

        // if (result)
        //     await redis.set(redisKey, JSON.stringify(result), {
        //         EX: 60 * 60 * 24,
        //     });

        return [];
    }
};

/**
 * xml 형태의 데이터를 embed 형태로 변환합니다
 * @param video_object
 * @returns
 */
export const convertVideoObject = (video_object: any) => {
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
        footer: {
            text: '제공. Youtube',
        },
    };
};

/**
 * 채널의 비디오 목록을 가져옵니다
 * @param notice_id
 * @param hash_id
 * @returns
 */
export const getChannelVideos = async (notice_id: number, hash_id: string) =>
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
