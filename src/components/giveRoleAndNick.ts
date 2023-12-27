import { insertAuthRule, tusu } from 'controllers/role';
import { IReply } from 'plugins/discord';
import discord, { changeNickname } from 'utils/discordApiInstance';
import errorEmbed from './errorEmbed';

import { chzzkAPI, ChzzkInterface } from 'utils/naverApiInstance';
import { ProfileData } from 'interfaces/API/Chzzk';
import { APIGuildMember } from 'discord-api-types/v10';

/**
 * 인증 인터페이스
 */
export interface IAuth {
    guild_id: string;
    user_id: string;
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

                break;
            }
            case '12': // 네이버
            case '13': {
                // 치지직
                chzzkAPI
                    .get<ChzzkInterface<ProfileData>>(`profile/${user_id}`)
                    .then(({ code, content, message }) => {
                        console.log('CONTENT', content);

                        if (code !== 200)
                            return interaction.reply({
                                embeds: [
                                    errorEmbed('CHZZKAPI', {
                                        target: 'profile',
                                        title: `ERROR - ${code}`,
                                        description: `치지직 프로필 조회에 실패 했습니다. - ${message}`,
                                    }),
                                ],
                            });

                        resolve({
                            nickname: `N] ${content.nickname.slice(0, 27)}}`,
                            profileImageUrl: content.profileImageUrl,
                        });
                    })
                    .catch((e: any) => {
                        console.error(e);
                        interaction.reply({
                            embeds: [
                                errorEmbed('CHZZKAPI', {
                                    target: 'profile',
                                    title: `ERROR - 404`,
                                    description: '치지직 프로필 조회에 실패 했습니다. - 요청에 실패하였습니다.',
                                }),
                            ],
                        });
                    });
                break;
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
export default async (interaction: IReply, { guild_id, auth_id, user_id, type }: IAuth) => {
    const user = await discord.get<APIGuildMember>(`/guilds/${guild_id}/members/${auth_id}`);
    if (!user) return interaction.reply({ embeds: [errorEmbed('USER_NOT_FOUND', { target: `auth-${auth_id}` })] });

    console.log('USER', user);

    try {
        // 최신 인증 정보를 불러옴
        const { role_id } = await insertAuthRule(auth_id, guild_id, type);

        const { roles, nick } = user;
        const hasRole = roles.includes(role_id);

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

        getNickname(interaction, type, user_id)
            .then(async ({ nickname, profileImageUrl }) => {
                await changeNickname(guild_id, auth_id, nickname).catch(e => {
                    interaction.reply({
                        embeds: [
                            errorEmbed('DISCORDAPI', {
                                target: `auth-${auth_id}`,
                                title: `ERROR - ${e.code}`,
                                description: '디스코드 닉네임 변경에 실패 했습니다.',
                            }),
                        ],
                    });
                });

                return interaction.reply({
                    embeds: [
                        {
                            title: '인증 성공',
                            description: `<@${auth_id}>\n성공적으로 인증이 완료 되었습니다.\n\n${nickname}님 환영합니다.`,
                            thumbnail: {
                                url: profileImageUrl,
                            },
                            color: 0x00ff00,
                        },
                    ],
                });
            })
            .catch(e => {
                return interaction.reply({
                    embeds: [
                        {
                            title: '인증 실패',
                            description: `닉네임을 정상적으로 불러오지 못하였습니다`,
                            color: 0xff0000,
                        },
                    ],
                });
            });
    } catch (e) {
        console.error('ERROR', e);
    }
};
