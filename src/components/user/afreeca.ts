import axios from 'axios';
import dayjs from 'dayjs';
import qs from 'querystring';

import { messageEdit } from 'components/discord';
import { sendMessageByChannels } from 'components/notice';
import { insertLiveEvents, updateLiveEvents } from 'controllers/bat';
import { upsertNotice } from 'controllers/notice';
import { APIEmbed, APIMessage } from 'discord-api-types/v10';
import { NoticeBat } from 'interfaces/notice';
import { createActionRow, createUrlButton } from 'utils/discord/component';
import { randomIntegerInRange } from 'utils/object';
import redis, { REDIS_KEY, saveRedis } from 'utils/redis';

interface ChannelData {
    user_id: string;
    user_nick: string;
    station_logo: string;
    medal: boolean;
    broad_no: string;
}

interface Station {
    userId: string;
    userNick: string;
    stationNo: number;
    stationName: string;
    stationTitle: string;
    broadStart: string;
    firstBroadDate: string;
    totalBroadTime: number;
    grade: number;
    joinTime: string;
    country: string;
    currentTimestamp: string;
    activeNo: number;
    profileImage: string;
    subscribeVisible: string;
}

export const getAfreecabeUser = async (guildId: string, afreecaId: string) => {
    try {
        const { station } = await axios
            .get<{
                station: Station;
            }>(`https://api-channel.sooplive.com/v1.1/channel/${afreecaId}/station`, {
                headers: {
                    'user-agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
                },
            })
            .then(res => res.data);
        console.log('AFREECA 사용자 정보', station);
        if (!station) {
            console.log('AFREECA 사용자 정보를 찾을 수 없습니다.', afreecaId);
            return 0;
        }

        const noticeId = await upsertNotice(
            guildId,
            {
                hash_id: afreecaId,
                notice_type: 5,
                message: '|| @everyone || Live ON Air! 📺',
                name: station.userNick,
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
            `https://sch.sooplive.co.kr/api.php?${qs.stringify({
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

    let title = '방송 정보가 없습니다!';
    let no = 0;
    let id = '';
    if (videoObject) {
        const { broadTitle, broadNo, userId } = videoObject;
        title = broadTitle;
        no = broadNo;
        id = userId;
    } else {
        id = 'orefinger';
    }
    return {
        title: title || 'LIVE ON',
        description: `<t:${time.unix()}:R>`,
        url: `https://play.sooplive.co.kr/${id}/${no}`,
        color: 0x0746af,
        thumbnail: { url: `https://profile.img.sooplive.com/LOGO/li/${id}/${id}.jpg` },
        image: { url: `https://liveimg.sooplive.co.kr/m/${no}?${randomIntegerInRange(100, 999)}` },
        footer: { text: name ?? 'TEST' },
        timestamp: time.format(),
    };
};

interface LiveStatus {
    broadNo: number;
    broadCateNo: number;
    parentBroadNo: number;
    userId: string;
    broadTitle: string;
    broadType: string;
    broadStart: string;
    currentSumViewer: number;
    broadGrade: number;
    subscriptionOnly: number;
    totalViewCnt: number;
    visitBroadType: number;
    isPassword: boolean;
    categoryName: string;
    categoryTags: string[];
    hashTags: string[];
    autoHashTags: string[];
    langTags: string[];
}

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
                    const { broadNo, broadTitle, broadStart, isPassword, userId } = content;
                    if (isPassword) return reject(null); // 비밀번호가 있는 경우 (비공개) 무시
                    // 온라인
                    if (lastId === broadNo) {
                        return reject(null);
                    } else {
                        await insertLiveEvents(noticeId, broadNo, {
                            image: `https://profile.img.sooplive.com/LOGO/li/${userId}/${userId}.jpg`,
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
                        `https://profile.img.sooplive.com/LOGO/li/${hash_id}/${hash_id}.jpg` ||
                        'https://cdn.orefinger.click/post/466950273928134666/d2d0cc31-a00e-414a-aee9-60b2227ce42c.png',
                },
            }))
        );

        await saveRedis(REDIS_KEY.DISCORD.LAST_MESSAGE(`${notice_id}`), messages, 60 * 60 * 24);
    } else {
        // offline
    }
};
