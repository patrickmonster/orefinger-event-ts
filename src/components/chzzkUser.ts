import { upsertNotice } from 'controllers/notice';
import { ChannelData } from 'interfaces/API/Chzzk';
import { ChzzkInterface, getChzzkAPI } from 'utils/naverApiInstance';
import redis, { REDIS_KEY } from 'utils/redis';

import qs from 'querystring';

const chzzk = getChzzkAPI('v1');

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
