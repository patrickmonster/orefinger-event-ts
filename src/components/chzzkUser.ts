import axios from 'axios';
import { sendChannels } from 'components/notice';
import { insertLiveEvents, updateLiveEvents } from 'controllers/bat';
import { upsertNotice } from 'controllers/notice';
import { APIEmbed, APIMessage } from 'discord-api-types/v10';
import { ChannelData, Content } from 'interfaces/API/Chzzk';
import { ChzzkInterface, getChzzkAPI } from 'utils/naverApiInstance';
import redis, { REDIS_KEY } from 'utils/redis';

import { auth } from 'controllers/auth';
import dayjs from 'dayjs';
import { NoticeBat } from 'interfaces/notice';
import { KeyVal } from 'interfaces/text';
import qs from 'querystring';
import { ENCRYPT_KEY, sha256 } from 'utils/cryptoPw';
import { appendTextWing, createActionRow, createSuccessButton, createUrlButton } from 'utils/discord/component';
import { messageEdit } from './discord';

const chzzk = getChzzkAPI('v1');

const hashIdChzzk = new RegExp('^[a-zA-Z0-9]{32}$');

export const isChzzkHash = (hashId: string): boolean => hashIdChzzk.test(hashId);

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

/**
 * 치치직 사용자 정보를 가져와, PK를 반환합니다
 * @param chzzkHash
 * @returns number
 */
export const getChzzkUser = async (chzzkHash: string, noticeType: number = 4): Promise<number> => {
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
                notice_type: noticeType,
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
export const searchChzzkUser = async (keyword: string): Promise<Array<KeyVal<string>>> => {
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
 * 메세지 수정
 *  - 라이브 종료시간을 수정합니다
 * @param notice_id
 * @param content
 */
const changeMessage = async (notice_id: number, content: any) => {
    const redisKey = REDIS_KEY.DISCORD.LAST_MESSAGE(`${notice_id}`);

    const messages = await redis.get(redisKey);
    if (messages) {
        const { closeDate } = content;
        for (const { id, message_reference, components, content, embeds, ...message } of JSON.parse(
            messages
        ) as APIMessage[]) {
            const [embed] = embeds;

            embed.description += `~ <t:${dayjs(closeDate).add(-9, 'h').unix()}:R>`;
            embed.timestamp = undefined;
            messageEdit(message.channel_id, id, {
                ...message,
                embeds,
            }).catch(console.error);

            await redis.del(redisKey);
        }
    }
};

/**
 * 채널의 비디오 목록을 가져옵니다
 * @param notice_ida
 * @param hashId
 * @returns
 */
export const getChannelLive = async (noticeId: number, hashId: string, liveId: string | number) =>
    new Promise<Content | null>((resolve, reject) => {
        axios
            .get(`https://api.chzzk.naver.com/service/v2/channels/${hashId}/live-detail`, {
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                },
            })
            .then(async ({ data }) => {
                const { content } = data;
                if (!content?.liveId || content.liveId === liveId) return reject(null);
                if (content && content.status === 'OPEN') {
                    await insertLiveEvents(noticeId, content.liveId, {
                        image: content.liveImageUrl?.replace('{type}', '1080') || '',
                        title: content.liveTitle,
                        game: content.liveCategory,
                        live_at: content.openDate,
                    });
                } else {
                    // close

                    if (content) {
                        try {
                            await changeMessage(noticeId, content);
                        } catch (e) {}
                    }
                    if (liveId && liveId != '0') {
                        const result = await updateLiveEvents(noticeId);
                        if (result.changedRows == 0) return reject(null);
                        // 이미 처리된 알림
                    }
                }
                resolve(content as Content);
            })
            .catch(reject);
    });

/**
 * 채널의 비디오 목록을 가져옵니다
 * @param notice_id
 * @param hash_id
 * @returns
 * @see getChannelLive
 * @see convertVideoObject
 * @see sendChannels
 */
export const getLiveMessage = async ({
    channels,
    notice_id: noticeId,
    hash_id: hashId,
    message,
    name,
    id,
    img_idx,
}: NoticeBat) => {
    const liveStatus = await getChannelLive(noticeId, hashId, id);
    if (liveStatus && liveStatus.status === 'OPEN') {
        // online
        const messages = await sendChannels(channels, {
            content: message,
            embeds: [convertVideoObject(liveStatus, name)],
            components: [
                createActionRow(
                    createSuccessButton(`notice attendance ${noticeId}`, {
                        label: appendTextWing('📌출석체크\u3164', 9), // 크기보정
                    }),
                    createUrlButton(`https://chzzk.naver.com/live/${hashId}`, {
                        emoji: { id: '1218118186717937775' },
                    })
                ),
            ],
        });

        const redisKey = REDIS_KEY.DISCORD.LAST_MESSAGE(`${noticeId}`);
        await redis.set(redisKey, JSON.stringify(messages), {
            EX: 60 * 60 * 24, // 12시간
        });
    }
};

/**
 * xml 형태의 데이터를 embed 형태로 변환합니다
 * @param videoObject
 * @returns APIEmbed
 */
const convertVideoObject = (videoObject: Content, name?: string): APIEmbed => {
    const {
        liveTitle: title,
        liveImageUrl,
        openDate,
        liveCategoryValue: game_name,
        categoryType,
        channel: { channelImageUrl, channelId, channelName },
    } = videoObject;
    const time = dayjs(openDate).add(-9, 'h');

    return {
        url: `https://chzzk.naver.com/live/${channelId}`,
        title,
        description: `<t:${time.unix()}:R>`,
        image: { url: liveImageUrl?.replace('{type}', '1080') || '', height: 1080, width: 1920 },
        color: 0x0ffa3,
        thumbnail: channelImageUrl ? { url: channelImageUrl } : undefined,
        fields: [{ name: categoryType || 'Game', value: `${game_name || 'LIVE'}`, inline: true }],
        footer: { text: name ?? channelName },
        timestamp: time.format(),
    };
};
