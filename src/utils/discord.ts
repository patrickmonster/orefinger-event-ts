import axios from 'axios';
import { ChannelType } from 'discord-api-types/v10';
import { APIGuildChannelWithChildren } from 'interfaces/API/Discord';
import { Attachment } from '../types/discord';
import { REGEX } from '../constants/discord';
import { getEmojis, getGuildChannels, getRoles } from '../services/discord/guild';

export const createAttachmentForm = async (...attachments: Attachment[]) => {
    const form = new FormData();
    const list = [];

    for (const { name, file, target } of attachments) {
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
        const roles = (await getRoles(guildId)).map(({ name, id }) => ({ name, id }));

        return message
            .replace(REGEX.ROLE, (match, name, id) => {
                const role = roles
                    .filter(role => role.name === name)
                    .find((e, i) => (id ? id.substring(1) === i : true));
                return role ? `<@&${role.id}>` : match;
            })
            .replace(REGEX.EMOJI, (match, name, id) => {
                const emoji = emojis
                    .filter(emoji => emoji.name === name)
                    .find((e, i) => (id ? id.substring(1) === i : true));
                return emoji ? `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>` : match;
            });
    } else {
        return message.replace(REGEX.DISCORD_MENTION, (match, name, id) => {
            const idx = emojis.filter(emoji => emoji.name === name).findIndex(emoji => emoji.id === id);
            return `:${name}${idx > 0 ? '~' + idx : ''}:`;
        });
    }
};

/**
 * 길드 채널 리스트 가이드 생성
 * @param guildId
 * @returns
 */
export const createChannelListGuide = async (guildId: string) => {
    const channels = await getGuildChannels(guildId);

    const message = channels
        .reduce((prev, curr) => {
            if (curr.type === ChannelType.GuildCategory) {
                prev.push({
                    ...curr,
                    children: channels.filter(channel => channel.parent_id === curr.id),
                });
            } else {
                if (!curr.parent_id)
                    prev.push({
                        ...curr,
                    });
            }
            return prev;
        }, [] as APIGuildChannelWithChildren[])
        .sort((a, b) => {
            if (a.type === ChannelType.GuildCategory && b.type !== ChannelType.GuildCategory) return 1;
            else return a.position - b.position;
        })
        .reduce((prev, curr) => {
            if ('children' in curr) {
                prev += `\n# ${curr.name}\n`;
                for (const channel of curr.children) {
                    prev += `  <#${channel.id}>\n`;
                    if ('topic' in channel && channel.topic) prev += `  ${channel.topic}\n`;
                    else prev += '\n';
                }
            } else {
                prev += `<#${curr.id}>\n`;
                if ('topic' in curr && curr.topic) prev += `  ${curr.topic}\n`;
                else prev += '\n';
            }
            return prev;
        }, '' as string);

    return message;
};
