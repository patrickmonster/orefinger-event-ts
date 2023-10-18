import moment from 'moment';
import { APIActionRowComponent, APIStringSelectComponent } from 'discord-api-types/v10';
import { getUser } from './twitch';
import { RESTPostAPIChannelMessage } from 'plugins/discord';

import discord from 'utils/discordApiInstance';
import { tusu } from 'controllers/role';
import errorEmbed from './errorEmbed';

/**
 * 트수 역할지급
 */
export default async (
    reply: (message: RESTPostAPIChannelMessage) => Promise<void>,
    guild_id: string,
    user_id: string,
    twitch_id: string,
    role_id: string
) => {
    getUser(twitch_id)
        .then(async ({ data: [user] }) => {
            if (!user) {
                return await reply({
                    content: '트수 정보를 찾을 수 없습니다.',
                });
            }
            const { login, display_name, profile_image_url } = user;
            const nick = display_name.toLowerCase() == login.toLowerCase() ? display_name : `${display_name}(${login})`.substring(0, 32);
            const [data] = await tusu(user_id, nick, role_id);

            if (!data) {
                return await reply({
                    embeds: [
                        errorEmbed('AUTH_TUSU_SELECT', {
                            target: `${guild_id}/${user_id}`,
                            title: '트수 역할지급 오류',
                            description: '데이터 무결성 오류 - 해당지급기가 존재하지 않습니다!',
                        }),
                    ],
                    // components :
                });
            }

            const { channel_id, ment } = data;

            try {
                await discord.put(`/guilds/${guild_id}/members/${user_id}/roles/${role_id}`);
                await reply({
                    content: `
<@${role_id}>역할 부여가 완료되었습니다!

### 닉네임 변경이 되지 않는경우!
일시적인 오류가 있을 수 있습니다!
관리자에게 문의해주세요!
                `,
                });

                if (channel_id && channel_id != 'null' && channel_id != 'undefined')
                    await discord
                        .post(`/channels/${channel_id}/messages`, {
                            content: `<@${user_id}>`,
                            embeds: [{ title: ment, author: { name: nick, icon_url: profile_image_url } }],
                        })
                        .catch(e => {});

                try {
                    await discord.patch(`/guilds/${guild_id}/members/${user_id}`, { nick });
                } catch (e) {}
            } catch (e) {
                return await reply({
                    embeds: [
                        errorEmbed('AUTH_TUSU_SELECT', {
                            target: `${guild_id}/${user_id}`,
                            title: '트수 역할지급 오류',
                            description: '데이터 무결성 오류 - 역할지급기가 존재하지 않습니다!',
                        }),
                    ],
                });
            }
        })
        .catch(async e => {
            return await reply({
                embeds: [
                    errorEmbed('AUTH_TUSU_SELECT', {
                        target: `${guild_id}/${user_id}`,
                        title: '역할조회 오류',
                        description: '사용자의 가입 정보를 찾을 수 없습니다!',
                    }),
                ],
                // components :
            });
        });
};
