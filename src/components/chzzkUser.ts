import axios from 'axios';
import { sendChannels } from 'components/notice';
import { insertLiveEvents, updateLiveEvents } from 'controllers/bat';
import { upsertNotice } from 'controllers/notice';
import { APIEmbed } from 'discord-api-types/v10';
import { ChannelData, Content } from 'interfaces/API/Chzzk';
import { ChzzkInterface, getChzzkAPI } from 'utils/naverApiInstance';
import redis, { REDIS_KEY } from 'utils/redis';

import { auth } from 'controllers/auth';
import { NoticeBat } from 'interfaces/notice';
import qs from 'querystring';
import { ENCRYPT_KEY, sha256 } from 'utils/cryptoPw';
import { createActionRow, createSuccessButton } from 'utils/discord/component';

const chzzk = getChzzkAPI('v1');

/**
 * 치치직 인증 방식(임시)
 * @param chzzkHash
 * @param authId
 * @returns
 */
export const getAuthChzzkUser = async (chzzkHash: string, authId: string) => {
    const { content, message } = await chzzk.get<
        ChzzkInterface<{
            channelId: string;
            channelName: string;
            channelImageUrl: string;
            channelDescription: string;
        }>
    >(`/channels/${chzzkHash}`);

    if (message) {
        return -1;
    }

    const hashKeyId = sha256(`${content.channelId}:${authId}`, ENCRYPT_KEY);

    if (content.channelDescription.includes(hashKeyId)) {
        // 인증완료
        await auth(
            'chzzk',
            authId,
            {
                id: content.channelId,
                username: content.channelName,
                discriminator: 'chzzk',
                avatar: content.channelImageUrl,
            },
            hashKeyId
        );

        return 1;
    } else {
        // 인증실패
        return hashKeyId;
    }
};

export const getChzzkUser = async (chzzkHash: string) => {
    try {
        const { code, message, content } = await chzzk.get<ChzzkInterface<ChannelData>>(`channels/${chzzkHash}`, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            },
        });
        if (code !== 200) {
            console.log('CHZZK 사용자 정보를 찾을 수 없습니다.', message);
            return 0;
        }

        // 알림 등록
        const noticeId = await upsertNotice(
            {
                hash_id: chzzkHash,
                notice_type: 4,
                message: '|| @everyone || Live ON Air! 📺',
                name: content.channelName,
            },
            true
        );

        return noticeId;
    } catch (e) {
        console.log('CHZZK 사용자 정보를 찾을 수 없습니다.', e);

        return 0;
    }
};

/**
 * 사용자 검색
 * @param keyword 검색어
 * @returns Array<{ name: string; value: string }>
 */
export const searchChzzkUser = async (keyword: string): Promise<Array<{ name: string; value: string }>> => {
    if (`${keyword}`.length < 2) return [];

    const redisKey = REDIS_KEY.API.SEARCH_USER(`chzzk:${keyword}`);

    try {
        const data = await redis.get(redisKey);
        if (data) {
            return JSON.parse(data);
        } else {
            throw new Error('no data');
        }
    } catch (e) {
        const {
            content: { data },
        } = await chzzk.get<
            ChzzkInterface<{
                size: number;
                page?: {
                    next: {
                        offset: number;
                    };
                };
                data: Array<{
                    live: any;
                    channel: ChannelData;
                }>;
            }>
        >(
            `/search/channels?${qs.stringify({
                keyword: `${keyword}`,
                offset: 0,
                size: 12,
            })}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                },
            }
        );

        const result = data.map(
            ({ channel: { channelId, channelName, verifiedMark } }): { name: string; value: string } => ({
                name: `${verifiedMark ? '인증됨]' : ''}${channelName}`,
                value: channelId,
            })
        );

        if (result)
            await redis.set(redisKey, JSON.stringify(result), {
                EX: 60 * 60 * 24,
            });

        return result || [];
    }
};

/**
 * 채널의 비디오 목록을 가져옵니다
 * @param notice_ida
 * @param hash_id
 * @returns
 */
export const getChannelLive = async (notice_id: number, hash_id: string, liveId: string | number) =>
    new Promise<Content | null>((resolve, reject) => {
        axios
            .get(`https://api.chzzk.naver.com/service/v2/channels/${hash_id}/live-detail`, {
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                },
            })
            .then(async ({ data }) => {
                const { content } = data;
                if (content.liveId === liveId || !content.liveId) return reject(null);
                if (content && content.status === 'OPEN') {
                    await insertLiveEvents(notice_id, content.liveId);
                } else {
                    if (liveId && liveId != '0') {
                        const result = await updateLiveEvents(notice_id);
                        if (result.changedRows == 0) return reject(null);
                        // 이미 처리된 알림
                    }
                }
                resolve(content as Content);
            })
            .catch(reject);
    });

export const getLiveMessage = async ({ channels, notice_id, hash_id, message, name, id, img_idx }: NoticeBat) => {
    const liveStatus = await getChannelLive(notice_id, hash_id, id);
    if (liveStatus && liveStatus.status === 'OPEN') {
        // online
        sendChannels(channels, {
            content: message,
            embeds: [convertVideoObject(liveStatus, name)],
            components: [
                createActionRow(
                    createSuccessButton(`notice attendance ${notice_id}`, {
                        label: '출석체크',
                        emoji: { id: '1218118186717937775' },
                    })
                ),
            ],
        });
    }
};

/**
 * xml 형태의 데이터를 embed 형태로 변환합니다
 * @param video_object
 * @returns
 */
const convertVideoObject = (video_object: Content, name?: string): APIEmbed => {
    const {
        liveTitle: title,
        liveImageUrl,
        // liveCategory: game_name,
        liveCategoryValue: game_name,
        categoryType,
        channel: { channelImageUrl, channelId, channelName },
    } = video_object;

    return {
        title,
        url: `https://chzzk.naver.com/live/${channelId}`,
        image: {
            url: liveImageUrl?.replace('{type}', '1080') || '',
        },
        author: {
            name: name ?? channelName,
            icon_url: channelImageUrl,
            url: `https://chzzk.naver.com/${channelId}`,
        },
        fields: [{ name: categoryType || 'Game', value: `${game_name || 'LIVE'}`, inline: true }],
        footer: { text: '제공. Chzzk' },
    };
};
