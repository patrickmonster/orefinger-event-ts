import axios from 'axios';
import dayjs from 'dayjs';
import qs from 'querystring';

import { messageEdit } from 'components/discord';
import { sendChannels } from 'components/notice';
import { insertLiveEvents, updateLiveEvents } from 'controllers/bat';
import { upsertNotice } from 'controllers/notice';
import { APIEmbed, APIMessage } from 'discord-api-types/v10';
import { Content } from 'interfaces/API/Afreeca';
import { NoticeBat } from 'interfaces/notice';
import afreecaAPI from 'utils/afreecaApiInstance';
import { appendTextWing, createActionRow, createSuccessButton, createUrlButton } from 'utils/discord/component';
import { randomIntegerInRange } from 'utils/object';
import redis, { REDIS_KEY } from 'utils/redis';

interface ChannelData {
    user_id: string;
    user_nick: string;
    station_logo: string;
    medal: boolean;
    broad_no: string;
}

export const getAfreecabeUser = async (afreecaId: string) => {
    try {
        const { station } = await afreecaAPI.get<Content>(`${afreecaId}/station`);
        if (!station) {
            console.log('AFREECA 사용자 정보를 찾을 수 없습니다.', afreecaId);
            return 0;
        }

        const noticeId = await upsertNotice(
            {
                hash_id: afreecaId,
                notice_type: 5,
                message: '|| @everyone || Live ON Air! 📺',
                name: station.user_nick,
            },
            true
        );
        return noticeId;
    } catch (e) {
        console.log('AFREECA 사용자 정보를 찾을 수 없습니다.', e);
        return 0;
    }
};

/**
 * 사용자 검색
 * @param keyword 검색어
 * @returns Array<{ name: string; value: string }>
 */
export const searchAfreecabeUser = async (keyword: string): Promise<Array<{ name: string; value: string }>> => {
    if (`${keyword}`.length < 2) return [];

    const redisKey = REDIS_KEY.API.SEARCH_USER(`afreeca:${keyword}`);

    try {
        const data = await redis.get(redisKey);
        if (data) {
            return JSON.parse(data);
        } else {
            throw new Error('no data');
        }
    } catch (e) {
        const {
            data: { suggest_bj: items },
        } = await axios.get<{
            suggest_bj: Array<ChannelData>;
        }>(
            `https://sch.afreecatv.com/api.php?${qs.stringify({
                m: 'searchHistory',
                service: 'list',
                d: `${keyword}`,
                v: '3.0',
            })}`,
            {
                headers: {
                    'user-agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
                },
            }
        );

        const result = items.map(({ user_id, user_nick }): { name: string; value: string } => ({
            name: user_nick,
            value: user_id,
        }));

        if (result)
            await redis.set(redisKey, JSON.stringify(result), {
                EX: 60 * 60 * 24,
            });

        return result || [];
    }
};

/**
 * xml 형태의 데이터를 embed 형태로 변환합니다
 * @param videoObject
 * @returns
 */
export const convertVideoObject = (videoObject: Content, name?: string): APIEmbed => {
    const {
        broad: { broad_title: title, broad_no, user_id },
        station: { user_nick: channelName, broad_start },
        profile_image: channelImageUrl,
    } = videoObject;
    const time = dayjs(broad_start).add(-9, 'h');

    return {
        title: title || 'LIVE ON',
        description: `<t:${time.unix()}:R>`,
        url: `https://play.afreecatv.com/${user_id}/${broad_no}`,
        color: 0x0746af,
        thumbnail: { url: channelImageUrl.startsWith('http') ? channelImageUrl : `https:${channelImageUrl}` },
        image: { url: `https://liveimg.afreecatv.com/m/${broad_no}?${randomIntegerInRange(100, 999)}` },
        footer: { text: name ?? channelName },
        timestamp: time.format(),
    };
};

/**
 * 채널의 비디오 목록을 가져옵니다
 * @param noticeId
 * @param hashId
 * @returns
 */
export const getChannelLive = async (noticeId: number, hashId: string, lastId: string | number) =>
    new Promise<Content | null>((resolve, reject) => {
        afreecaAPI
            .get<Content>(`${hashId}/station`)
            .then(async content => {
                const {
                    broad, // 방송 정보
                    station, // 채널 정보
                    profile_image, // 프로필 이미지
                } = content;

                if (broad) {
                    if (broad.is_password) return reject(null); // 비밀번호가 있는 경우 (비공개) 무시
                    // 온라인
                    const { broad_no } = broad;
                    if (lastId === broad_no) {
                        return reject(null);
                    } else {
                        await insertLiveEvents(noticeId, broad_no, {
                            image: profile_image,
                            title: broad.broad_title,
                            game: 'TALK',
                            live_at: dayjs(station.broad_start).add(-9, 'h').format(),
                            chat: '-',
                        });
                    }
                } else {
                    // 오프라인

                    if (content) {
                        try {
                            await changeMessage(noticeId, content);
                        } catch (e) {}
                    }
                    if (lastId && lastId != '0') {
                        const result = await updateLiveEvents(noticeId);
                        if (result.changedRows == 0) {
                            // 이미 처리된 알림
                            return reject(null);
                        }
                    }
                }
                resolve(content);
            })
            .catch(reject);
    });

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

export const getLiveMessage = async ({ channels, notice_id, hash_id, message, name, img_idx, id }: NoticeBat) => {
    const liveStatus = await getChannelLive(notice_id, hash_id, id);
    if (liveStatus) {
        // online
        const embed = convertVideoObject(liveStatus, name);

        const messages = await sendChannels(channels, {
            content: message,
            embeds: [embed],
            components: [
                createActionRow(
                    createSuccessButton(`notice attendance ${notice_id}`, {
                        label: appendTextWing('📌출석체크\u3164', 9), // 크기보정
                    }),
                    createUrlButton(`${embed.url}`, {
                        emoji: { id: '1218118186717937775' },
                    })
                ),
            ],
        });

        const redisKey = REDIS_KEY.DISCORD.LAST_MESSAGE(`${notice_id}`);
        await redis.set(redisKey, JSON.stringify(messages), {
            EX: 60 * 60 * 24, // 12시간
        });
    } else {
        // offline
    }
};
