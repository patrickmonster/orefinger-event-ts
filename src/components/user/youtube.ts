import axios from 'axios';
import { upsertNotice } from 'controllers/notice';
import redis, { REDIS_KEY, saveRedis } from 'utils/redis';

import https from 'https';

import { sendMessageByChannels } from 'components/notice';
import { insertVideoEvents, selectVideoEvents } from 'controllers/bat';
import { APIEmbed } from 'discord-api-types/v10';
import { NoticeBat } from 'interfaces/notice';
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
        if (result) await saveRedis(redisKey, result, 60 * 60 * 24);

        return result || [];
    }
};

const fetch = (url: string): Promise<string> =>
    new Promise((resolve, reject) => {
        const request = https.request(url, response => {
            let text = '';
            response.setEncoding('utf-8');
            response.on('data', data => (text += data));
            response.on('end', () => resolve(text));
        });
        request.on('error', error => reject(error));
        request.end();
    });

interface ChannelObject {
    title: string;
    description: string;
    rssUrl: string;
    externalId: string;
    keywords: string;
    channelUrl: string;
    isFamilySafe: boolean;
    androidDeepLink: string;
    androidAppindexingLink: string;
    iosAppindexingLink: string;
    vanityChannelUrl: string;
}
/**
 * https://www.youtube.com/channel/${hashId}/videos
 * @param hashId
 * @returns { channel: ChannelObject, videos: any[] }
 */
export const channelVideos = async (hashId: string) => {
    const html = await fetch(`https://www.youtube.com/channel/${hashId}/videos`);
    const match = html.match(/var ytInitialData = (.*)]}}};/)?.[1];

    if (!match) return {};

    const { contents, metadata } = JSON.parse(match + ']}}}');
    const videosTab = contents.twoColumnBrowseResultsRenderer.tabs.find((tab: any) =>
        tab?.tabRenderer?.title?.match(/vídeos|videos|Video|동영상/i)
    ); // 해당하는 탭의 데이터를 가져옵니다
    const channel: ChannelObject = metadata.channelMetadataRenderer;

    if (!videosTab) return {};
    const results = [];

    try {
        const videos = videosTab.tabRenderer.content.richGridRenderer?.contents?.slice(0, 5);
        for (const data of videos) {
            const video = data?.richItemRenderer?.content?.videoRenderer;

            if (!video) continue;

            results.push({
                title: video.title.runs[0].text,
                id: video.videoId,
                thumbnails: video.thumbnail.thumbnails,
            });
        }
    } catch (err) {
        console.log(err);
    }

    return {
        channel,
        videos: results,
    };
};

/**
 * https://www.youtube.com/channel/${hashId}/shorts
 * @param hashId
 * @returns { channel: ChannelObject, videos: any[] }
 */
export const channelShorts = async (hashId: string) => {
    const html = await fetch(`https://www.youtube.com/channel/${hashId}/shorts`);
    const match = html.match(/var ytInitialData = (.*)]}}};/)?.[1];

    if (!match) return {};

    const { contents, metadata } = JSON.parse(match + ']}}}');
    const shortTab = contents.twoColumnBrowseResultsRenderer.tabs.find((tab: any) =>
        tab?.tabRenderer?.title?.match(/shorts|Shorts/i)
    ); // 해당하는 탭의 데이터를 가져옵니다
    const channel: ChannelObject = metadata.channelMetadataRenderer;

    if (!shortTab) return {};
    const results = [];

    try {
        const shorts = shortTab.tabRenderer.content.richGridRenderer?.contents?.slice(0, 5);
        for (const data of shorts) {
            const short = data?.richItemRenderer?.content?.reelItemRenderer;

            if (!short) continue;

            results.push({
                title: short.headline.simpleText,
                id: short.videoId,
                thumbnails: short.thumbnail.thumbnails,
            });
        }
    } catch (err) {
        console.log(err);
    }

    return {
        channel,
        videos: results,
    };
};

interface Thumbnails {
    url: string;
    width: number;
    height: number;
}

/**
 * xml 형태의 데이터를 embed 형태로 변환합니다
 * @param video_object
 * @returns
 */
export const convertVideoObject = (video_object: any): APIEmbed => {
    const { id, title, thumbnails } = video_object;

    return {
        title,
        url: `https://www.youtube.com/watch?v=${id}`,
        color: 0xf40001,
        image: thumbnails.reduce((prev: Thumbnails, curr: Thumbnails) => (prev.width > curr.width ? prev : curr)),
        footer: {
            text: '제공. Youtube',
        },
    };
};

export const getVideoMessage = async ({
    channels,
    notice_id: noticeId,
    hash_id: hashId,
    message,
    name,
    id,
}: NoticeBat) => {
    const { videos, channel_title } = await getChannelVideos(noticeId, hashId);
    for (const video of videos) {
        sendMessageByChannels(
            channels.map(channel => ({
                ...channel,
                hook: {
                    name: channel_title || '방송알리미',
                },
                message: {
                    content: message,
                    embeds: [
                        {
                            ...video,
                            author: {
                                name: name || channel_title,
                                url: `https://www.youtube.com/channel/${hashId}`,
                                icon_url:
                                    'https://cdn.discordapp.com/attachments/682449668428529743/1125234663045201950/yt_icon_rgb.png',
                            },
                        },
                    ],
                },
            }))
        );
    } // for
};

/**
 * 채널의 비디오 목록을 가져옵니다
 * @param noticeId
 * @param hashId
 * @returns
 */
export const getChannelVideos = async (noticeId: number, hashId: string) =>
    new Promise<{
        videos: any[];
        channel_title: string;
    }>(async (resolve, reject) => {
        const { channel, videos: entry } = await channelVideos(hashId);
        const { channel: shortChannel, videos: shorts } = await channelShorts(hashId);

        if (!entry?.length && !shorts?.length) return resolve({ videos: [], channel_title: '' });

        const originVideos = [...(entry || []), ...(shorts || [])];
        // 기존 비디오 목록을 가져옵니다
        const oldVideos = await selectVideoEvents(noticeId);

        const videos = [];
        try {
            for (const video_object of originVideos) {
                const { id, title } = video_object;
                // 이미 등록된 비디오는 건너뜁니다 (중복 방지) / 이전 데이터 rss 용 필터
                if (oldVideos.find(v => v.video_id === id)) continue;

                try {
                    await insertVideoEvents(noticeId, id, title);
                    videos.push(convertVideoObject(video_object));
                } catch (e) {
                    continue;
                }
            }
            resolve({ videos, channel_title: `${(channel || shortChannel)?.title}` });
        } catch (e) {
            reject(e);
        }
    });
