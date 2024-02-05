import {
    APIApplicationCommandInteractionDataIntegerOption,
    APIApplicationCommandInteractionDataNumberOption,
    APIApplicationCommandInteractionDataOption,
    APIApplicationCommandInteractionDataStringOption,
    APIApplicationCommandInteractionDataSubcommandGroupOption,
    APIApplicationCommandInteractionDataSubcommandOption,
} from 'discord-api-types/v10';
import { ChannelData } from 'interfaces/API/Chzzk';
import { APIChatInputApplicationCommandInteractionData } from 'plugins/discord';
import { ChzzkInterface, getChzzkAPI } from 'utils/naverApiInstance';
import redis, { REDIS_KEY } from 'utils/redis';

import qs from 'querystring';

const chzzk = getChzzkAPI('v1');

type FocusedType =
    | APIApplicationCommandInteractionDataNumberOption
    | APIApplicationCommandInteractionDataStringOption
    | APIApplicationCommandInteractionDataIntegerOption;

const getInputItems = (options: APIApplicationCommandInteractionDataOption[]): FocusedType[] | undefined => {
    return options?.reduce((acc, cur) => {
        if ([10, 3, 4].includes(cur.type)) {
            acc.push(cur as FocusedType);
        } else {
            const data = getInputItems(
                (
                    cur as
                        | APIApplicationCommandInteractionDataSubcommandOption
                        | APIApplicationCommandInteractionDataSubcommandGroupOption
                ).options || []
            );
            if (data) acc.push(...data);
        }
        return acc;
    }, [] as FocusedType[]);

    // APIApplicationCommandInteractionDataNumberOption | APIApplicationCommandInteractionDataStringOption | APIApplicationCommandInteractionDataIntegerOption
};

const autoComponent = async (
    interaction: APIChatInputApplicationCommandInteractionData,
    replay: (data: Array<{ name: string; value: string }>) => void
) => {
    // 자동완성
    const { options } = interaction;

    const item = getInputItems(options || [])?.find(item => item.focused);

    if (!item) return;

    switch (item.name) {
        case '치지직': {
            // https://api.chzzk.naver.com/service/v1/search/lives?keyword=%EB%B0%A9%EC%86%A1&offset=0&size=12
            //  api 호출 or redis

            if (`${item.value}`.length < 2) {
                console.log('검색어가 너무 짧음', item.value);

                return replay([]);
            }

            const redisKey = REDIS_KEY.API.SEARCH_USER(`${item.value}`);

            try {
                const data = await redis.get(redisKey);
                console.log('탐색', redisKey, data);
                if (data) {
                    replay(JSON.parse(data));
                    return;
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
                        keyword: `${item.value}`,
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

                console.log(result);

                replay(result || []);

                if (result)
                    await redis.set(redisKey, JSON.stringify(result), {
                        EX: 60 * 60 * 24,
                    });
            }
            break;
        }
    }
};

export default autoComponent;
