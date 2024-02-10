import { channelUpsert } from 'controllers/channel';
import {
    RESTGetAPIChannelWebhooksResult,
    RESTGetAPIGuildChannelsResult,
    RESTGetAPIGuildResult,
    RESTPostAPIChannelWebhookResult,
    RESTPostAPIGuildChannelJSONBody,
    RESTPostAPIGuildChannelResult,
} from 'discord-api-types/rest/v10';

// import { RedisJSON } from 'redis';
import discord from 'utils/discordApiInstance';
import { REDIS_KEY, catchRedis } from 'utils/redis';
import { getEmojis, getMemtions } from './discord';

export const guild = async (guild_id: string) => await discord.get<RESTGetAPIGuildResult>(`/guilds/${guild_id}`);

export const channels = async (guildId: string) =>
    catchRedis(
        REDIS_KEY.DISCORD.GUILD_CHANNELS(guildId),
        async () => await discord.get<RESTGetAPIGuildChannelsResult>(`/guilds/${guildId}/channels`),
        60 * 60
    );

export const channelCreate = async (guild_id: string, data: RESTPostAPIGuildChannelJSONBody) => {
    const channel = await discord.post<RESTPostAPIGuildChannelResult>(`/guilds/${guild_id}/channels`, data);
    const update = await channelUpsert([
        {
            guild_id,
            channel_id: channel.id,
            name: channel.name || '',
            type: channel.type,
        },
    ]);

    console.log('CREATE CHANNEL', update);
    return channel;
};

// export const channelDelete = async (channel_id: string) =>

export const channel = async (channel_id: string) =>
    await discord.get<RESTPostAPIGuildChannelResult>(`/channels/${channel_id}`);

export const webhooks = async (channel_id: string) =>
    await discord.get<RESTGetAPIChannelWebhooksResult>(`/channels/${channel_id}/webhooks`);

export const webhookCreate = async (channel_id: string, data: { name: string; avatar?: string }) =>
    await discord.post<RESTPostAPIChannelWebhookResult>(`/channels/${channel_id}/webhooks`, data);

const discordRegex = /<[a]?:([\w|\d]+):(\d{17,19})>/im; // 맨션
const emojiRegex = /:(\w+)(~\d)?:/gim; // 이모티콘
const roleRegex = /@([ㄱ-ㅎ가-힣a-zA-Z0-9]+)(~\d)?/gim; // 역할

export const castMessage = async (guildId: string, message: string, isSendMessage: boolean) => {
    const emojis = (await getEmojis(guildId)).map(({ name, id, animated }) => ({ name, id, animated }));

    if (isSendMessage) {
        const roles = (await getMemtions(guildId)).map(({ name, id }) => ({ name, id }));

        return message
            .replace(roleRegex, (match, name, id) => {
                const role = roles
                    .filter(role => role.name === name)
                    .find((e, i) => (id ? id.substring(1) === i : true));
                return role ? `<@&${role.id}>` : match;
            })
            .replace(emojiRegex, (match, name, id) => {
                const emoji = emojis
                    .filter(emoji => emoji.name === name)
                    .find((e, i) => (id ? id.substring(1) === i : true));
                return emoji ? `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>` : match;
            });
    } else {
        return message.replace(discordRegex, (match, name, id) => {
            const idx = emojis.filter(emoji => emoji.name === name).findIndex(emoji => emoji.id === id);
            return `:${name}${idx > 0 ? '~' + idx : ''}:`;
        });
    }
};
