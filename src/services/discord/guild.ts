import {
    RESTGetAPIGuildEmojisResult,
    RESTGetAPIGuildResult,
    RESTPostAPIGuildChannelJSONBody,
    RESTPostAPIGuildChannelResult,
} from 'discord-api-types/v10';
import { APIGuildChannel } from 'interfaces/API/Discord';
import { REDIS_KEY, catchRedis } from 'utils/redis';
import { CACHE_DURATION } from '../../constants/discord';
import { getDiscord, postDiscord } from './api';
import { channelUpsert } from 'controllers/channel';

export const getEmojis = async (guildId: string): Promise<RESTGetAPIGuildEmojisResult> =>
    catchRedis(
        REDIS_KEY.DISCORD.GUILD_EMOJIS(guildId),
        async () => await getDiscord<RESTGetAPIGuildEmojisResult>(`/guilds/${guildId}/emojis`),
        CACHE_DURATION.GUILD_EMOJIS
    );

export const getGuild = async (guildId: string): Promise<RESTGetAPIGuildResult> =>
    catchRedis(
        REDIS_KEY.DISCORD.GUILD(guildId),
        async () => await getDiscord<RESTGetAPIGuildResult>(`/guilds/${guildId}?with_counts=true`),
        CACHE_DURATION.GUILD
    );

export const getGuildChannels = async (guildId: string): Promise<APIGuildChannel[]> =>
    catchRedis(
        REDIS_KEY.DISCORD.GUILD_CHANNELS(guildId),
        async () => await getDiscord<APIGuildChannel[]>(`/guilds/${guildId}/channels`),
        CACHE_DURATION.GUILD_CHANNELS
    );

export const getGuildInvites = async (guildId: string): Promise<APIGuildChannel[]> =>
    catchRedis(
        REDIS_KEY.DISCORD.GUILD_INVITES(guildId),
        async () => await getDiscord<APIGuildChannel[]>(`/guilds/${guildId}/invites`),
        CACHE_DURATION.GUILD_INVITES
    );

export const getRoles = async (guildId: string): Promise<RESTGetAPIGuildEmojisResult> =>
    catchRedis(
        REDIS_KEY.DISCORD.GUILD_ROLES(guildId),
        async () => await getDiscord<RESTGetAPIGuildEmojisResult>(`/guilds/${guildId}/roles`),
        CACHE_DURATION.GUILD_ROLES
    );

export const createChannel = async (guild_id: string, data: RESTPostAPIGuildChannelJSONBody) => {
    const channel = await postDiscord<RESTPostAPIGuildChannelResult>(`/guilds/${guild_id}/channels`, {
        body: data,
    });
    await channelUpsert([
        {
            guild_id,
            channel_id: channel.id,
            name: channel.name || '',
            type: channel.type,
        },
    ]);
    return channel;
};
