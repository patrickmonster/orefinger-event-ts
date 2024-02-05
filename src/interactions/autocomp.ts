import { APIInteractionDataOptionBase, ApplicationCommandOptionType } from 'discord-api-types/v10';
import { APIApplicationCommandInteraction, APIChatInputApplicationCommandInteractionData } from 'plugins/discord';
import { ChzzkInterface, getChzzkAPI } from 'utils/naverApiInstance';

import { ChannelData } from 'interfaces/API/Chzzk';
import qs from 'querystring';
import redis, { REDIS_KEY } from 'utils/redis';

const chzzk = getChzzkAPI('v1');

const autoComponent = async (
    interaction: Omit<APIApplicationCommandInteraction, 'data' | 'type'> &
        APIChatInputApplicationCommandInteractionData,
    replay: (data: Array<{ name: string; value: string }>) => void
) => {
    // 자동완성
    const { name, options } = interaction;
    const value = (
        options?.find(item => item.name === 'target') as APIInteractionDataOptionBase<
            ApplicationCommandOptionType.String,
            string
        >
    ).value;

    switch (name) {
        case 'chzzk':
        case '치지직':
            // https://api.chzzk.naver.com/service/v1/search/lives?keyword=%EB%B0%A9%EC%86%A1&offset=0&size=12
            //  api 호출 or redis

            const target = options?.find(item => item.name === 'target');
            if (!target) return;
            const redisKey = REDIS_KEY.API.SEARCH_USER(value);

            try {
                const data = await redis.get(redisKey);
                if (data) {
                    replay(JSON.parse(data));
                    return;
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
                    `/search/lives?${qs.stringify({
                        keyword: value,
                        offset: 0,
                        size: 12,
                    })}`
                );

                const result = data.map(
                    ({ channel: { channelId, channelName, verifiedMark } }): { name: string; value: string } => ({
                        name: `${verifiedMark ? '인증됨]' : ''}${channelName}`,
                        value: channelId,
                    })
                );
                replay(result);

                await redis.set(redisKey, JSON.stringify(result), {
                    EX: 60 * 60 * 24,
                });
            }
            break;
    }
};

export default autoComponent;
