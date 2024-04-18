import { RequestData } from '@discordjs/rest';
import axios from 'axios';
import { channelUpsert } from 'controllers/channel';
import { upsertWebhook } from 'controllers/guild/webhook';
import { CreateMessage } from 'controllers/log';
import {
    RESTGetAPIChannelResult,
    RESTGetAPIChannelWebhooksResult,
    RESTGetAPIGuildChannelsResult,
    RESTGetAPIGuildEmojisResult,
    RESTGetAPIGuildResult,
    RESTGetAPIUserResult,
    RESTPostAPIChannelMessageJSONBody,
    RESTPostAPIChannelMessageResult,
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

export const postDiscord = async <T>(url: `/${string}`, options?: RequestData | undefined) =>
    discord.post(url, options) as T;
export const getDiscord = async <T>(url: `/${string}`, options?: RequestData | undefined) =>
    discord.get(url, options) as T;

export const getEmojis = async (guildId: string): Promise<RESTGetAPIGuildEmojisResult> =>
    catchRedis(
        REDIS_KEY.DISCORD.GUILD_EMOJIS(guildId),
        async () => await getDiscord<RESTGetAPIGuildEmojisResult>(`/guilds/${guildId}/emojis`),
        60 * 30 // 30분
    );
export const getGuild = async (guildId: string): Promise<RESTGetAPIGuildResult> =>
    catchRedis(
        REDIS_KEY.DISCORD.GUILD(guildId),
        async () => await getDiscord<RESTGetAPIGuildResult>(`/guilds/${guildId}?with_counts=true`),
        60 * 30 // 30분
    );

export const getGuildChannels = async (guildId: string): Promise<RESTGetAPIGuildChannelsResult> =>
    catchRedis(
        REDIS_KEY.DISCORD.GUILD_CHANNELS(guildId),
        async () => await getDiscord<RESTGetAPIGuildChannelsResult>(`/guilds/${guildId}/channels`),
        60 * 30 // 30분
    );

export const getChannel = async (channelId: string): Promise<RESTGetAPIChannelResult> =>
    catchRedis(
        REDIS_KEY.DISCORD.CHANNELS(channelId),
        async () => await getDiscord<RESTGetAPIChannelResult>(`/channels/${channelId}`),
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
        async () => await getDiscord<RESTGetAPIUserResult>(`/users/${userId}`),
        60 * 30 // 30분
    );

export const webhooks = async (channel_id: string) =>
    await getDiscord<RESTGetAPIChannelWebhooksResult>(`/channels/${channel_id}/webhooks`);

export const webhookCreate = async (channel_id: string, data: { name: string; avatar?: string }) =>
    await postDiscord<RESTPostAPIChannelWebhookResult>(`/channels/${channel_id}/webhooks`, { body: data }).then(res => {
        upsertWebhook(channel_id, {
            name: data.name || undefined,
            webhook_id: res.id,
            token: res.token,
        }).catch(() => {});

        return res;
    });

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

export const messageCreate = async (channel_id: string, body: RESTPostAPIChannelMessageJSONBody) =>
    postDiscord<RESTPostAPIChannelMessageResult>(`/channels/${channel_id}/messages`, { body }).then(async res => {
        CreateMessage({
            channel_id,
            message_id: res.id,
            message: JSON.stringify(body),
        }).catch(() => {});

        return res;
    });

export const messageDelete = async (channelId: string, messageId: string) =>
    discord.delete(`/channels/${channelId}/messages/${messageId}`);

export const messageEdit = async (channelId: string, messageId: string, body: RESTPostAPIChannelMessageJSONBody) =>
    discord.patch(`/channels/${channelId}/messages/${messageId}`, { body });

const discordRegex = /<[a]?:([\w|\d]+):(\d{17,19})>/im; // 맨션
const emojiRegex = /:(\w+)(~\d)?:/gim; // 이모티콘
const roleRegex = /@([ㄱ-ㅎ가-힣a-zA-Z0-9]+)(~\d)?/gim; // 역할

/**
 * 메세지 캐스팅
 *  - 역할, 이모티콘을 맨션으로 변경
 * @param guildId
 * @param message
 * @param isSendMessage
 * @returns
 */
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
