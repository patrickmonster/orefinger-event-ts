import { MessageInteraction } from 'interactions/message';

import authTokenSelect from 'components/authTokenSelect';
import giveRoleAndNick from 'components/giveRoleAndNick';
import { upsertDiscordUserAndJWTToken } from 'controllers/auth';
import { createButtonArrays, createUrlButton } from 'utils/discord/component';

/**
 *
 * 인증 - OAuth2.0
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, typeId: string) => {
    const { user, member, guild_id } = interaction;
    const userId = user?.id || member?.user.id; // 사용자 ID

    if (!guild_id) return; // 길드만 가능한 명령어 입니다.

    await interaction.differ({ ephemeral: true });

    await authTokenSelect(userId || '0', `select rules ${typeId}`, Number(typeId))
        .then(async user => {
            if (Array.isArray(user)) {
                interaction.reply({
                    components: user,
                });
            } else {
                console.log('user ::', user);
                giveRoleAndNick(interaction, {
                    guild_id: guild_id,
                    auth_id: user.auth_id,
                    user_id: user.user_id,
                    nick: user.name,
                    type: typeId,
                }).catch(e => {
                    // TODO: 에러 처리
                    console.log('e', e);
                });
            }
        })
        .catch(async e => {
            const apiUser = member?.user || user;

            if (!apiUser)
                return await interaction.reply({
                    content: `잘못된 접근 방식 입니다.`,
                    ephemeral: true,
                });

            const jwt = await upsertDiscordUserAndJWTToken(apiUser);

            await interaction.reply({
                content: `
현재 로그인 정보가 없는 상태 입니다.

권한을 부여받기 위해서는 계정 연결이 필요합니다.
하단의 버튼을 눌러, 홈페이지에 접속하여 계정 연결을 진행해 주세요!  
                `,
                embeds: [
                    {
                        title: `계정 연결하기`,
                        description: `계정 연결을 위해, 아래의 버튼을 눌러주세요!`,
                        image: {
                            url: 'https://cdn.orefinger.click/post/466950273928134666/b0f65bdf-c229-4a46-9fa9-406e9a16b771.png',
                        },
                        color: 0x00ff00,
                    },
                ],
                components: createButtonArrays(
                    createUrlButton(
                        `https://orefinger.click/discord/jwt?code=${jwt}&target=${typeId}&guild_id=${guild_id}`,
                        {
                            label: `홈페이지에 접속하여 계정 연결하기`,
                        }
                    )
                ),
            });
        });
};
