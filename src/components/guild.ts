import discord from 'utils/discordApiInstance';

// 맨트 변경에 필요한 형식
const discordRegex = /<[a]?:([\w|\d]+):(\d{17,20})>/im; // 맨션
const emojiRegex = /:(\w+)(~\d)?:/gim; // 이모티콘
const roleRegex = /@([ㄱ-ㅎ가-힣a-zA-Z0-9]+)(~\d)?/gim; // 역할

/**
 * 맨트 변경
 * @param guild_id
 * @param message
 * @param is_convert
 */
export const mentConvert = async (guild_id: string, message: string, is_convert: boolean) => {
    const {
        data: { emojis, roles },
    } = await discord.get<{
        roles: {
            id: string;
            name: string;
            color: number;
        }[];
        emojis: {
            id: string;
            name: string;
            roles: string[];
            animated: boolean;
        }[];
    }>(`/guilds/${guild_id}`);

    let content = message;
    if (is_convert) {
        // 타이핑 맨트 -> 저장용
        while (true) {
            // emote
            const emote = emojiRegex.exec(message);
            if (!emote) break;
            const [content_name, v_name, count] = emote;
            const emoji = emojis.filter(e => e.name === v_name).find((e, i) => (count ? parseInt(count.substring(1)) == i : true));
            if (emoji) {
                content = `${content.slice(0, emote.index)}<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>${content.slice(
                    emote.index + content_name.length
                )}`;
            } // 없으면 넘어가
        }
        while (true) {
            // role
            const role = roleRegex.exec(message);
            if (!role) break;
            const [content_name, v_name, count] = role;
            const role_obj = roles.filter(e => e.name == v_name).find((e, i) => (count ? parseInt(count.substring(1)) == i : true));
            if (role_obj) {
                content = `${content.slice(0, role.index)}<@&${role_obj.id}>${content.slice(role.index + content_name.length)}`;
            } // 없으면 넘어가
        }
    } else {
        while (true) {
            //
            const emote = discordRegex.exec(message);
            if (!emote) break;
            const [content_name, v_name, id] = emote;
            const idx = emojis.filter(emoji => emoji.name == v_name).findIndex(e => e.id == id);
            content = `${content.slice(0, emote.index)}:${idx > 0 ? `${v_name}~${idx}` : v_name}:${content.slice(emote.index + content_name.length)}`;
        }
    }

    return content;
};
