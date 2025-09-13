import {
    RESTGetAPIChannelResult,
    RESTPutAPIChannelPermissionJSONBody,
} from 'discord-api-types/v10';
import { REDIS_KEY, catchRedis } from 'utils/redis';
import { CACHE_DURATION } from '../../constants/discord';
import { getDiscord, putDiscord } from './api';

export const getChannel = async (channelId: string): Promise<RESTGetAPIChannelResult> =>
    catchRedis(
        REDIS_KEY.DISCORD.CHANNELS(channelId),
        async () => await getDiscord<RESTGetAPIChannelResult>(`/channels/${channelId}`),
        CACHE_DURATION.CHANNELS
    );

export const putChannelPermission = async (
    channelId: string,
    permissionId: string,
    body: RESTPutAPIChannelPermissionJSONBody
) => await putDiscord(`/channels/${channelId}/permissions/${permissionId}`, { body });
