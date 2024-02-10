import axios from 'axios';
import { RESTGetAPIGuildEmojisResult } from 'discord-api-types/v10';
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
        async () => await discord.get<RESTGetAPIGuildEmojisResult>(`/guilds/${guildId}/emojis`),
        60 * 30 // 30분
    );

export const getMemtions = async (guildId: string): Promise<RESTGetAPIGuildEmojisResult> =>
    catchRedis(
        REDIS_KEY.DISCORD.GUILD_ROLES(guildId),
        async () => await discord.get<RESTGetAPIGuildEmojisResult>(`/guilds/${guildId}/roles`),
        60 * 30 // 30분
    );

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
