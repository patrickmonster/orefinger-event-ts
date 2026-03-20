import dayjs from 'dayjs';
import { APIEmbed } from 'discord-api-types/v10';
import qs from 'querystring';

import { messageEdit, messageHookEdit } from 'components/discord';
import { sendMessageByChannels } from 'components/notice';

import { Content } from 'interfaces/API/Chzzk';
import { ChannelType, NoticeBat, OriginMessage } from 'interfaces/notice';
import { KeyVal } from 'interfaces/text';

import { createActionRow, createUrlButton } from 'utils/discord/component';
import redis, { REDIS_KEY, saveRedis } from 'utils/redis';
import { rplayAPI } from 'utils/rplayApiInstance';

const hashIdChzzk = new RegExp('^[a-zA-Z0-9]{32}$');

export const isChzzkHash = (hashId: string): boolean => hashIdChzzk.test(hashId);

/**
 * 치치직 인증 방식(임시)
 * @param chzzkHash
 * @param authId
 * @returns
 */
// export const getAuthChzzkUser = async (chzzkHash: string, authId: string) => {
//     const { content, message } = await rplayAPI.get<
//         {
//             channelId: string;
//             channelName: string;
//             channelImageUrl: string;
//             channelDescription: string;
//     >(`/channels/${chzzkHash}`);

//     if (message) {
//         return -1;
//     }

//     const hashKeyId = sha256(`${content.channelId}:${authId}`, ENCRYPT_KEY);

//     if (content.channelDescription.includes(hashKeyId)) {
//         // 인증완료
//         await auth(
//             'rplay',
//             authId,
//             {
//                 id: content.channelId,
//                 username: content.channelName,
//                 discriminator: 'rplay',
//                 avatar: content.channelImageUrl,
//             },
//             hashKeyId
//         );

//         return 1;
//     } else {
//         // 인증실패
//         return hashKeyId;
//     }
// };

/**
 * 치치직 사용자 정보를 가져와, PK를 반환합니다
 * @param chzzkHash
 * @returns number
 */
// export const getChzzkUser = async (guildId: string, chzzkHash: string, noticeType: number = 4): Promise<number> => {
//     try {
//         const { code, message, content } = await rplayAPI.get<ChzzkInterface<ChannelData>>(`channels/${chzzkHash}`, {
//             headers: {
//                 'Content-Type': 'application/json',
//                 'User-Agent':
//                     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
//             },
//         });
//         if (code !== 200) {
//             console.log('RPLAY 사용자 정보를 찾을 수 없습니다.', message);
//             return 0;
//         }

//         // 알림 등록
//         const noticeId = await upsertNotice(
//             guildId,
//             {
//                 hash_id: chzzkHash,
//                 notice_type: noticeType,
//                 message: '|| @everyone || Live ON Air! 📺',
//                 name: content.channelName,
//             },
//             true
//         );

//         return noticeId;
//     } catch (e) {
//         console.log('RPLAY 사용자 정보를 찾을 수 없습니다.', e);

//         return 0;
//     }
// };

/**
 * 사용자 검색
 * @param keyword 검색어
 * @returns Array<{ name: string; value: string }>
 */
export const searchRplayUser = async (keyword: string): Promise<Array<KeyVal<string>>> => {
    if (`${keyword}`.length < 2) return [];

    const redisKey = REDIS_KEY.API.SEARCH_USER(`rplay:${keyword}`);

    try {
        const data = await redis.get(redisKey);
        if (data) {
            return JSON.parse(data);
        } else {
            throw new Error('no data');
        }
    } catch (e) {
        // https://api.rplay.live/
        const {
            creatorResult: { list: data, metadata },
        } = await rplayAPI.get<{
            creatorResult: {
                list: Array<string>;
                metadata: {
                    [key: string]: {
                        _id: string;
                        nickname: string;
                        customUrl: string;
                        channelLanguage: string;
                        isLivestreamer: boolean;
                        blind: boolean;
                    };
                };
            };
        }>(
            `/content/main-search?${qs.stringify({
                offset: 0,
                size: 12,
                adult: true,
                keyword: `${encodeURIComponent(keyword)}`,
                lang: 'ko',
                requestorOid: '69a548294412d2adb549de66',
                platformType: 'rplay',
                loginType: 'pla',
            })}&contentTypes[]=file&contentTypes[]=video&contentTypes[]=storyChat&contentTypes[]=game&ct[]=roleplay&ct[]=${encodeURIComponent('알플챗')}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                },
            }
        );

        const result = Object.values(metadata).map(
            ({ _id, nickname, isLivestreamer, channelLanguage, customUrl }): { name: string; value: string } => ({
                name: `${isLivestreamer ? '[라이브]' : '[비활성]'} ${channelLanguage} ${nickname}`,
                value: customUrl || _id,
            })
        );
        if (result) await saveRedis(redisKey, result, 60 * 60 * 24);

        return result || [];
    }
};

/**
 * 메세지 수정
 *  - 라이브 종료시간을 수정합니다
 * @param notice_id
 * @param content
 */
const changeMessage = async (notice_id: number, content: Content) => {
    const redisKey = REDIS_KEY.DISCORD.LAST_MESSAGE(`${notice_id}`);

    const messages = await redis.get(redisKey);
    if (messages) {
        const { closeDate } = content;
        for (const {
            id,
            channel_type,
            url,
            message: { message_reference, components, content, embeds, ...message },
        } of JSON.parse(messages) as OriginMessage[]) {
            const [embed] = embeds;
            const time = dayjs(closeDate).add(-9, 'h');

            embed.description += `~ <t:${time.unix()}:R>`;
            embed.timestamp = time.format();

            switch (channel_type) {
                case ChannelType.TEXT:
                    messageEdit(message.channel_id, id, {
                        ...message,
                        embeds,
                        components: [],
                    }).catch(console.error);
                    break;
                case ChannelType.WEBHOOK:
                    messageHookEdit(url, id, {
                        ...message,
                        embeds,
                        components: [],
                    }).catch(console.error);
                    break;
            }

            await redis.del(redisKey);
        }
    }
};

/**
 *
 * @param hashId
 * @returns
 */
// export const getLive = async (hashId: string) =>
//     chzzkV2
//         .get<{ content: Content }>(`channels/${hashId}/live-detail`, {
//             headers: {
//                 'User-Agent':
//                     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
//             },
//         })
//         .then(async ({ content }) => content);

/**
 * 채널의 비디오 목록을 가져옵니다
 * @param notice_ida
 * @param hashId
 * @returns 라이브가 유효한 경우, Content
 */
export const getChannelLive = async (noticeId: number, hashId: string, liveId: string | number) =>
    new Promise<Content | null>((resolve, reject) => {
        // getLive(hashId)
        //     .then(async content => {
        //         // 콘텐츠의 라이브 id 가 없거나, 라이브 id 가 같으면 무시
        //         if (!content?.liveId || content.liveId === liveId) return reject(null);
        //         // 화질 정보는 제거함 (불필요)
        //         if ('livePlaybackJson' in content) delete content.livePlaybackJson;
        //         content.channelId = hashId;
        //         // 라이브가 진행중인 경우
        //         if (content && content.status === 'OPEN') {
        //             // 이전에 라이브 정보가 있었다면, 라이브 정보를 업데이트 ( 마감 )
        //             await insertLiveEvents(noticeId, content.liveId, {
        //                 image: content.liveImageUrl?.replace('{type}', '1080') || '',
        //                 title: content.liveTitle,
        //                 game: content.liveCategory,
        //                 live_at: content.openDate,
        //                 chat: content.chatChannelId,
        //             });
        //             if (liveId != '0') {
        //                 // 기존 라이브 정보가 있었다면 ( 라이브 교체 )
        //                 // clientEmit('liveStatus', noticeId);
        //                 // 라이브 정보를 캐시합니다
        //                 await cacheRedis(REDIS_KEY.API.CHZZK_LIVE_STATE(`${noticeId}`), content, 60 * 60 * 12);
        //                 return reject(null);
        //             }
        //         } else if (content && content.status == 'CLOSE') {
        //             // 이전 라이브 정보가 있었다면, 라이브 정보를 업데이트 ( 마감 )
        //             changeMessage(noticeId, content).catch(() => {});
        //             if (liveId && liveId != '0') {
        //                 // 오프라인
        //                 const { changedRows } = await updateLiveEvents(noticeId);
        //                 if (changedRows == 0) return reject(null);
        //             } else return reject(null); // 이미 처리된 알림
        //         }
        //         // 라이브 정보를 캐시합니다
        //         if (content) {
        //             cacheRedis(REDIS_KEY.API.CHZZK_LIVE_STATE(`${noticeId}`), content, 60 * 60 * 12).catch(() => {});
        //         }
        //         return resolve(content as Content);
        //     })
        //     .catch(reject);
    });

/**
 * 채널의 비디오 목록을 가져옵니다
 * @param notice_id
 * @param hash_id
 * @returns
 * @see getChannelLive
 * @see convertVideoObject
 * @see sendMessageByChannels
 */
export const getLiveMessage = async ({
    channels,
    notice_id: noticeId,
    hash_id: hashId,
    message,
    name,
    id,
}: NoticeBat) => {
    const liveStatus = await getChannelLive(noticeId, hashId, id);
    if (liveStatus && liveStatus.status === 'OPEN') {
        const messages = await sendMessageByChannels(
            channels.map(channel => {
                return {
                    ...channel,
                    message: {
                        content: message,
                        embeds: [convertVideoObject(liveStatus, name)],
                        components: [
                            createActionRow(
                                createUrlButton(`https://chzzk.naver.com/live/${hashId}`, {
                                    emoji: { id: '1218118186717937775' },
                                })
                            ),
                        ],
                        username: liveStatus.channel?.channelName || '방송알리미',
                        avatar_url:
                            liveStatus.channel.channelImageUrl ||
                            'https://cdn.orefinger.click/post/466950273928134666/d2d0cc31-a00e-414a-aee9-60b2227ce42c.png',
                    },
                };
            })
        );

        await saveRedis(
            REDIS_KEY.DISCORD.LAST_MESSAGE(`${noticeId}`),
            messages,
            60 * 60 * 24 // 12시간
        );
    } else if (liveStatus && liveStatus.status == 'CLOSE') {
    }
    return liveStatus;
};

/**
 * xml 형태의 데이터를 embed 형태로 변환합니다
 * @param videoObject
 * @returns APIEmbed
 */
export const convertVideoObject = (videoObject: Content, name?: string): APIEmbed => {
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
        fields: [{ name: '카테고리', value: `${game_name || 'LIVE'}` }],
        // fields: [{ name: categoryType || 'Game', value: `${game_name || 'LIVE'}` }],
        footer: { text: name ?? channelName },
        timestamp: time.format(),
    };
};
