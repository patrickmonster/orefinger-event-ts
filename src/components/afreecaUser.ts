import axios from 'axios';
import { upsertNotice } from 'controllers/notice';
import redis, { REDIS_KEY } from 'utils/redis';

import { Content } from 'interfaces/API/Afreeca';
import qs from 'querystring';
import afreecaAPI from 'utils/afreecaApiInstance';

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
            // https://sch.afreecatv.com/api.php?m=searchHistory&service=list&d=9%25ED%2598%25B8&_=1709010129455&v=3.0
            `https://sch.afreecatv.com/api.php?${qs.stringify({
                m: 'searchHistory',
                service: 'list',
                d: `${keyword}`,
                // _ :'1708908097116',
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
