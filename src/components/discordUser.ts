// 디스코드 사용자 관련 라이브러리
import discord from 'utils/discordApiInstance';
import { getUser as getTwitchUser } from './twitch';

/**
 * Twitch 명으로 사용자 정보를 변경합니다.
 * @param twitch_id Twitch ID
 * @param auth_id Discord ID
 */
export const setUserNick = async (twitch_id: string, auth_id: string) => {
    const {
        data: [user],
    } = await getTwitchUser(twitch_id);
    const nick = (user.display_name.toLowerCase() == user.login ? user.display_name : `${user.display_name}(${user.login})`).substring(0, 32);
    return await discord.patch(`/guilds/${process.env.GUILD_ID}/members/${auth_id}`, {
        nick,
    });
};
