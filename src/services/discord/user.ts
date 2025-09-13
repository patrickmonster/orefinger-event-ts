import { RESTGetAPIUserResult } from 'discord-api-types/v10';
import { REDIS_KEY, catchRedis } from 'utils/redis';
import { CACHE_DURATION } from '../../constants/discord';
import { getDiscord } from './api';

export const getUser = async (userId: string) =>
    catchRedis(
        REDIS_KEY.DISCORD.USER(userId),
        async () => await getDiscord<RESTGetAPIUserResult>(`/users/${userId}`),
        CACHE_DURATION.USER
    );
