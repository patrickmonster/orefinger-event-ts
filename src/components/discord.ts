import axios from 'axios';
import { channelUpsert } from 'controllers/channel';
import {
    RESTGetAPIChannelResult,
    RESTGetAPIChannelWebhooksResult,
    RESTGetAPIGuildChannelsResult,
    RESTGetAPIGuildEmojisResult,
    RESTGetAPIGuildResult,
    RESTGetAPIUserResult,
    RESTPostAPIChannelMessageJSONBody,
    RESTPostAPIChannelWebhookResult,
    RESTPostAPIGuildChannelJSONBody,
    RESTPostAPIGuildChannelResult,
} from 'discord-api-types/v10';
import discord from 'utils/discordApiInstance';
import { REDIS_KEY, catchRedis } from 'utils/redis';

export type Attachment = {
    name: string;
    file: Blob | string;
    target?: string;
};

export const getEmojis = async (guildId: string): Promise<RESTGetAPIGuildEmojisResult> =>
    catchRedis(
        REDIS_KEY.DISCORD.GUILD_EMOJIS(guildId),
        async () => (await discord.get(`/guilds/${guildId}/emojis`)) as RESTGetAPIGuildEmojisResult,
        60 * 30 // 30분
    );
export const getGuild = async (guildId: string): Promise<RESTGetAPIGuildResult> =>
    catchRedis(
        REDIS_KEY.DISCORD.GUILD(guildId),
        async () => (await discord.get(`/guilds/${guildId}?with_counts=true`)) as RESTGetAPIGuildResult,
        60 * 30 // 30분
    );

export const getGuildChannels = async (guildId: string): Promise<RESTGetAPIGuildChannelsResult> =>
    catchRedis(
        REDIS_KEY.DISCORD.GUILD_CHANNELS(guildId),
        async () => (await discord.get(`/guilds/${guildId}/channels`)) as RESTGetAPIGuildChannelsResult,
        60 * 30 // 30분
    );

export const getChannel = async (channelId: string): Promise<RESTGetAPIChannelResult> =>
    catchRedis(
        REDIS_KEY.DISCORD.CHANNELS(channelId),
        async () => (await discord.get(`/channels/${channelId}`)) as RESTGetAPIChannelResult,
        60 * 30 // 30분
    );

export const getMemtions = async (guildId: string): Promise<RESTGetAPIGuildEmojisResult> =>
    catchRedis(
        REDIS_KEY.DISCORD.GUILD_ROLES(guildId),
        async () => (await discord.get(`/guilds/${guildId}/roles`)) as RESTGetAPIGuildEmojisResult,
        60 * 30 // 30분
    );

export const getUser = async (userId: string) =>
    catchRedis(
        REDIS_KEY.DISCORD.USER(userId),
        async () => (await discord.get(`/users/${userId}`)) as RESTGetAPIUserResult,
        60 * 30 // 30분
    );

export const webhooks = async (channel_id: string) =>
    (await discord.get(`/channels/${channel_id}/webhooks`)) as RESTGetAPIChannelWebhooksResult;

export const webhookCreate = async (channel_id: string, data: { name: string; avatar?: string }) =>
    (await discord.post(`/channels/${channel_id}/webhooks`, { body: data })) as RESTPostAPIChannelWebhookResult;

export const attachmentFile = async (...url: Attachment[]) => {
    const form = new FormData();
    const list = [];

    for (const { name, file, target } of url) {
        if (file) {
            form.append(
                'files[]',
                typeof file === 'string' ? await axios.get(file, { responseType: 'blob' }) : file,
                name
            );
            if (target) list.push({ name, target });
        }
    }

    for (const { name, target } of list) form.append(target, name);

    return form;
};

export const channelCreate = async (guild_id: string, data: RESTPostAPIGuildChannelJSONBody) => {
    const channel = (await discord.post(`/guilds/${guild_id}/channels`, {
        body: data,
    })) as RESTPostAPIGuildChannelResult;
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

export const messageCreate = async (channel_id: string, body: RESTPostAPIChannelMessageJSONBody) =>
    discord.post(`/channels/${channel_id}/messages`, { body });

export const messageDelete = async (channelId: string, messageId: string) =>
    discord.delete(`/channels/${channelId}/messages/${messageId}`);

export const messageEdit = async (channelId: string, messageId: string, body: RESTPostAPIChannelMessageJSONBody) =>
    discord.patch(`/channels/${channelId}/messages/${messageId}`, { body });

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
