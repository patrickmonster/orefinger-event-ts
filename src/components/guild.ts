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
import redis, { REDIS_KEY } from 'utils/redis';

// 멘트 변경에 필요한 형식
const discordRegex = /<[a]?:([\w|\d]+):(\d{17,20})>/im; // 맨션
const emojiRegex = /:(\w+)(~\d)?:/gim; // 이모티콘
const roleRegex = /@([ㄱ-ㅎ가-힣a-zA-Z0-9]+)(~\d)?/gim; // 역할

export const guild = async (guild_id: string) => await discord.get<RESTGetAPIGuildResult>(`/guilds/${guild_id}`);

export const channels = async (guild: string, isCash = false) => {
    if (isCash) {
        const channels = await redis.get(REDIS_KEY.DISCORD.GUILD_CHANNELS(guild));
        if (channels) return JSON.parse(channels) as RESTGetAPIGuildChannelsResult;
    }

    const data = await discord.get<RESTGetAPIGuildChannelsResult>(`/guilds/${guild}/channels`);
    await redis.set(REDIS_KEY.DISCORD.GUILD_CHANNELS(guild), JSON.stringify(data), { EX: 60 * 60 });
    const update = await channelUpsert(
        data.map(e => ({ guild_id: guild, channel_id: e.id, name: e.name || '', type: e.type }))
    );
    console.log('LOADING CHANNEL', update);
    return data;
};

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

/**
 * 멘트 변경
 * @param guild_id
 * @param message
 * @param is_convert
 */
export const mentConvert = async (guild_id: string, message: string, is_convert: boolean) => {
    const { emojis, roles } = await guild(guild_id);

    let content = message;
    if (is_convert) {
        // 타이핑 멘트 -> 저장용
        while (true) {
            // emote
            const emote = emojiRegex.exec(message);
            if (!emote) break;
            const [content_name, v_name, count] = emote;
            const emoji = emojis
                .filter(e => e.name === v_name)
                .find((e, i) => (count ? parseInt(count.substring(1)) == i : true));
            if (emoji) {
                content = `${content.slice(0, emote.index)}<${emoji.animated ? 'a' : ''}:${emoji.name}:${
                    emoji.id
                }>${content.slice(emote.index + content_name.length)}`;
            } // 없으면 넘어가
        }
        while (true) {
            // role
            const role = roleRegex.exec(message);
            if (!role) break;
            const [content_name, v_name, count] = role;
            const role_obj = roles
                .filter(e => e.name == v_name)
                .find((e, i) => (count ? parseInt(count.substring(1)) == i : true));
            if (role_obj) {
                content = `${content.slice(0, role.index)}<@&${role_obj.id}>${content.slice(
                    role.index + content_name.length
                )}`;
            } // 없으면 넘어가
        }
    } else {
        while (true) {
            //
            const emote = discordRegex.exec(message);
            if (!emote) break;
            const [content_name, v_name, id] = emote;
            const idx = emojis.filter(emoji => emoji.name == v_name).findIndex(e => e.id == id);
            content = `${content.slice(0, emote.index)}:${idx > 0 ? `${v_name}~${idx}` : v_name}:${content.slice(
                emote.index + content_name.length
            )}`;
        }
    }

    return content;
};
