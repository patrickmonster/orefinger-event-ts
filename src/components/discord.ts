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
