import axios from 'axios';
import dayjs from 'dayjs';

import { sendMessageByChannels } from 'components/notice';
import { insertLiveEvents, updateLiveEvents } from 'controllers/bat';
import { upsertNotice } from 'controllers/notice';
import { APIEmbed } from 'discord-api-types/v10';
import { NoticeBat } from 'interfaces/notice';
import { createActionRow, createUrlButton } from 'utils/discord/component';
import redis, { REDIS_KEY, saveRedis } from 'utils/redis';

interface ChannelData {
    user_id: string;
    user_nick: string;
    station_logo: string;
    medal: boolean;
    broad_no: string;
}

interface Station {
    id: string;
    slug: string;
    name: string;
    description: string;
    isLive: boolean;
    level: number;
    followerCount: number;
    imageUrl: string;
    videoBannerImageUrl: string | null;
    isFollowing: boolean;
    isSubscribed: boolean;
    isNotificationEnabled: boolean;
    canSubscription: boolean;
    canChatDonation: boolean;
    canVideoDonation: boolean;
    canMissionDonation: boolean;
    isHide: boolean;
    isBanned: boolean;
}

export interface LiveStatus {
    id: string;
    title: string;
    state: 'ACTIVE' | 'INACTIVE';
    openedAt: string;
    imageUrl: string;
    playbackUrl?: string;
    playback?: {
        id: string | null;
        url: string;
        liveStreamId: string;
        uhdFps: number | null;
        urlUhd: string | null;
        uhdActive: boolean;
        canWatchUhd: boolean;
        isMultitrack: boolean;
    };
    isAdult: boolean;
    curViewerCnt: number;
    clipActive: boolean;
    channel: {
        id: string;
        slug: string;
        name: string;
        description: string;
        isLive: boolean;
        level: number;
        followerCount: number;
        imageUrl: string;
        videoBannerImageUrl: string | null;
        isFollowing: boolean;
        isSubscribed: boolean;
        isNotificationEnabled: boolean;
        canSubscription: boolean;
        canChatDonation: boolean;
        canVideoDonation: boolean;
        canMissionDonation: boolean;
        isHide: boolean;
        isBanned: boolean;
    };
    category?: {
        id: string;
        name: string;
        code: string;
        imageUrl: string;
    };
    tags: Array<{
        id: string;
        name: string;
    }>;
}

export const getCimeUser = async (guildId: string, userId: string) => {
    try {
        const {
            bodyData: { live },
        } = await axios
            .get<{
                bodyData: { live: LiveStatus };
            }>(`https://ci.me/json/@${userId}/live`, {
                headers: {
                    'user-agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
                },
            })
            .then(res => res.data);

        console.log('CIME 사용자 정보', live);
        if (!live) {
            console.log('CIME 사용자 정보를 찾을 수 없습니다.', userId);
            return 0;
        }

        const noticeId = await upsertNotice(
            guildId,
            {
                hash_id: userId,
                notice_type: 16,
                message: '|| @everyone || Live ON Air! 📺',
                name: live.channel.name,
            },
            true
        );
        return noticeId;
    } catch (e) {
        console.log('CIME 사용자 정보를 찾을 수 없습니다.', e);
        return 0;
    }
};

/**
 * 사용자 검색
 * @param keyword 검색어
 * @returns Array<{ name: string; value: string }>
 */
export const searchCimeUser = async (keyword: string): Promise<Array<{ name: string; value: string }>> => {
    if (`${keyword}`.length < 1) return [];

    const redisKey = REDIS_KEY.API.SEARCH_USER(`cime:${keyword}`);

    try {
        const data = await redis.get(redisKey);
        if (data) {
            return JSON.parse(data);
        } else {
            throw new Error('no data');
        }
    } catch (e) {
        const {
            bodyData: { sections },
        } = await axios
            .get<{
                bodyData: {
                    sections: Array<{
                        type: string;
                        items: Station[];
                    }>;
                };
            }>(`https://ci.me/json/search?query=${keyword}`, {
                headers: {
                    'user-agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
                },
            })
            .then(res => res.data);

        const items = sections.filter(section => section.type === 'CHANNEL').flatMap(section => section.items) || [];

        const result = items.map(({ name, slug }): { name: string; value: string } => ({
            name: name,
            value: slug,
        }));

        if (result) await saveRedis(redisKey, result, 60 * 60 * 24);
        return result || [];
    }
};

/**
 * xml 형태의 데이터를 embed 형태로 변환합니다
 * @param videoObject
 * @returns
 */
export const convertVideoObject = (videoObject: LiveStatus, name?: string): APIEmbed => {
    console.log(videoObject);
    const time = dayjs().add(-9, 'h');

    const {
        title: liveTitle,
        id: liveId,
        channel: { slug, imageUrl: channelImageUrl },
        imageUrl,
    } = videoObject;

    return {
        title: liveTitle || 'LIVE ON',
        description: `<t:${time.unix()}:R>`,
        url: imageUrl,
        color: 0x8956fb,
        thumbnail: { url: channelImageUrl },
        image: { url: imageUrl },
        footer: { text: name ?? 'TEST' },
        timestamp: time.format(),
    };
};

export const getLive = async (hashId: string) => {
    const { data } = await axios.get<LiveStatus>(
        `https://api-channel.sooplive.com/v1.1/channel/${hashId}/home/section/broad`
    );
    return data;
};

/**
 * 채널의 비디오 목록을 가져옵니다
 * @param noticeId
 * @param hashId
 * @returns
 */
export const getChannelLive = async (noticeId: number, hashId: string, lastId: string | number) =>
    new Promise<LiveStatus | null>((resolve, reject) => {
        getLive(hashId)
            .then(async content => {
                if (content) {
                    const {
                        id,
                        title: broadTitle,
                        openedAt: broadStart,
                        channel: { slug, imageUrl: channelImageUrl },
                    } = content;
                    // 온라인
                    if (lastId === id) {
                        return reject(null);
                    } else {
                        await insertLiveEvents(noticeId, id, {
                            image: channelImageUrl,
                            title: broadTitle,
                            game: 'TALK',
                            live_at: dayjs(broadStart).add(-9, 'h').format(),
                            chat: '-',
                        });
                    }
                } else {
                    // 오프라인
                    if (lastId && lastId != '0') {
                        const result = await updateLiveEvents(noticeId);
                        if (result.changedRows == 0) {
                            // 이미 처리된 알림
                            return reject(null);
                        }
                    }

                    return resolve(null);
                }
                resolve(content);
            })
            .catch(reject);
    });

export const getLiveMessage = async ({ channels, notice_id, hash_id, message, name, id }: NoticeBat) => {
    const liveStatus = await getChannelLive(notice_id, hash_id, id);
    if (liveStatus) {
        // online
        const embed = convertVideoObject(liveStatus, name);

        const messages = await sendMessageByChannels(
            channels.map(channel => ({
                ...channel,
                message: {
                    content: message,
                    embeds: [embed],
                    components: [
                        createActionRow(
                            createUrlButton(`${embed.url}`, {
                                emoji: { id: '1247013958842449993' },
                            })
                        ),
                    ],
                    username: name || '방송알리미',
                    avatar_url:
                        liveStatus.channel.imageUrl ||
                        'https://cdn.orefinger.click/post/466950273928134666/d2d0cc31-a00e-414a-aee9-60b2227ce42c.png',
                },
            }))
        );

        await saveRedis(REDIS_KEY.DISCORD.LAST_MESSAGE(`${notice_id}`), messages, 60 * 60 * 24);
    } else {
        // offline
    }
};
