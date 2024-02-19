import { basename } from 'path';

import authTokenSelect from 'components/authTokenSelect';
import authTusuSelect from 'components/authTusuSelect';
import { upsertDiscordUserAndJWTToken } from 'controllers/auth';
import { MessageInteraction } from 'interactions/message';
import { createButtonArrays, createUrlButton } from 'utils/discord/component';

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');

/**
 *
 * 구 인증
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, command: string) => {
    const { user, guild_id, member } = interaction;

    await interaction.differ({ ephemeral: true });
    await authTokenSelect(user?.id || member?.user.id || '0', `select role ${command || 0}`, 3)
        .then(async user => {
            if (Array.isArray(user)) {
                interaction.reply({
                    components: user,
                });
            } else {
                console.log('user', user);
                await authTusuSelect(interaction, guild_id || '', user.auth_id || '0', user.user_id, command || '0');
            }
        })
        .catch(async e => {
            console.log('e', e);

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

권한을 부여받기 위해서는, 계정 연결이 필요합니다.
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
                    createUrlButton(`https://orefinger.click/discord/jwt?code=${jwt}&target=3`, {
                        label: `홈페이지에 접속하여 계정 연결하기`,
                    })
                ),
            });
        });
};

export default {
    alias: ['rule'],
};
