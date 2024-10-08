import { insertAuthRule } from 'controllers/role';
import { IReply } from 'plugins/discord';
import discord, { changeNickname } from 'utils/discordApiInstance';
import errorEmbed from './errorEmbed';

import { APIGuildMember } from 'discord-api-types/v10';
import { sendNoticeByBord } from './notice';
import { addPointUser } from './user/point';

/**
 * 인증 인터페이스
 */
export interface IAuth {
    guild_id: string;
    user_id: string;
    nick: string;
    auth_id: string;
    type: string;
}

const getNickname = async (
    interaction: IReply,
    type: string,
    user_id: string
): Promise<{
    nickname: string;
    profileImageUrl: string;
}> => {
    return new Promise((resolve, reject) => {
        switch (type) {
            case '8': {
                // 카카오
                resolve({
                    nickname: `K] ${user_id.slice(0, 27)}}`,
                    profileImageUrl:
                        'https://cdn.orefinger.click/post/466950273928134666/b0f65bdf-c229-4a46-9fa9-406e9a16b771.png',
                });
                break;
            }
            case '12': // 네이버
            case '13': {
                resolve({
                    nickname: `N] ${user_id.slice(0, 27)}}`,
                    profileImageUrl:
                        'https://cdn.orefinger.click/post/466950273928134666/b0f65bdf-c229-4a46-9fa9-406e9a16b771.png',
                });
                // 치지직
                // chzzkAPI
                //     .get<ChzzkInterface<ProfileData>>(`profile/${user_id}`)
                //     .then(({ code, content, message }) => {
                //         console.log('CONTENT', content);

                //         if (code !== 200)
                //             return interaction.reply({
                //                 embeds: [
                //                     errorEmbed('CHZZKAPI', {
                //                         target: 'profile',
                //                         title: `ERROR - ${code}`,
                //                         description: `치지직 프로필 조회에 실패 했습니다. - ${message}`,
                //                     }),
                //                 ],
                //             });

                //         resolve({
                //             nickname: `N] ${content.nickname.slice(0, 27)}}`,
                //             profileImageUrl: content.profileImageUrl,
                //         });
                //     })
                //     .catch((e: any) => {
                //         console.error(e);
                //         interaction.reply({
                //             embeds: [
                //                 errorEmbed('CHZZKAPI', {
                //                     target: 'profile',
                //                     title: `ERROR - 404`,
                //                     description: '치지직 프로필 조회에 실패 했습니다. - 요청에 실패하였습니다.',
                //                 }),
                //             ],
                //         });
                //     });
                // break;
            }
            default: {
                reject();
            }
        }
    });
};

/**
 * 역할 및 닉네임을 부여 합니다.
 */
export default async (interaction: IReply, { guild_id, auth_id, user_id, nick, type }: IAuth) => {
    const user = (await discord.get(`/guilds/${guild_id}/members/${auth_id}`)) as APIGuildMember;
    if (!user) return interaction.reply({ embeds: [errorEmbed('USER_NOT_FOUND', { target: `auth-${auth_id}` })] });

    console.log('USER', user);

    try {
        // 최신 인증 정보를 불러옴
        const { role_id, tag_kr, affectedRows, nick_name } = await insertAuthRule(auth_id, guild_id, type);

        const { roles, nick: originNick } = user;
        if (!role_id) {
            return interaction.reply({
                embeds: [
                    errorEmbed('ROLE_NOT_FOUND', {
                        target: `auth-${auth_id}`,
                        title: '역할이 지정되지 않았습니다! - (해당 인증의 역할이 지정되지 않아, 작업이 취소됩니다...)',
                    }),
                ],
            });
        }
        const hasRole = roles.includes(role_id);
        // const changeNick = `${tag_kr}]${nick}`;
        const changeNick = nick_name.replace(/\{([^\}]+)\}/gi, (match: string, p1: string) => {
            switch (p1) {
                case 'nick':
                    return nick;
                case 'target':
                    return tag_kr;
                default:
                    return match;
            }
        });

        if (!hasRole) {
            try {
                await discord.put(`/guilds/${guild_id}/members/${auth_id}/roles/${role_id}`);
            } catch (e: any) {
                return interaction.reply({
                    embeds: [
                        errorEmbed('DISCORDAPI', {
                            target: `auth-${auth_id}`,
                            title: `ERROR - ${e.code}`,
                            description: '디스코드 역할 부여에 실패 했습니다.',
                        }),
                    ],
                });
            }
        }

        if (originNick != changeNick) {
            try {
                await changeNickname(guild_id, auth_id, changeNick);
            } catch (e: any) {
                console.log('ERROR', e);

                return interaction.reply({
                    embeds: [
                        errorEmbed('DISCORDAPI', {
                            target: `auth-${auth_id}`,
                            title: `ERROR - ${e.code}`,
                            description: `
디스코드 닉네임 변경에 실패 했습니다.

# 혹시, 서버 관리자 이시면, 디스코드 정책에 의해 닉네임 변경이 제한되었을 수 있습니다.
(서버 사용자가 서버 관리자의 닉네임을 바꿀 수 없어욧!!!!)
                            `,
                        }),
                    ],
                });
            }
        }

        if (originNick != changeNick && !hasRole)
            addPointUser(auth_id || '', 1000, `역할부여 포인트 지급 ${guild_id} - ${auth_id} `);

        interaction.reply({
            embeds: [
                {
                    title: '인증 성공',
                    description: `<@${auth_id}>\n성공적으로 인증이 완료 되었습니다.\n\n${tag_kr}]${nick}님 환영합니다.${
                        originNick != changeNick && !hasRole ? '\n\n1,000포인트가 지급되었습니다.' : ''
                    }`,
                    color: 0x00ff00,
                },
            ],
        });
        // 알림을 전송합니다 - 알림타입  3
        if (affectedRows && affectedRows != 0) {
            sendNoticeByBord(guild_id || '0', `3_${type}`, {
                user: `${nick}(${user_id}) - <@${auth_id}> 님이 인증하셨습니다!`,
            });
        }
    } catch (e) {
        console.error('ERROR', e);
    }
};
