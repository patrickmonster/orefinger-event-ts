import { MessageMenuInteraction } from 'fastify-discord';

import { upsertAuthBorde } from 'controllers/guild/authDashbord';

/**
 *
 * 사용자 소셜 로그인 데시보드 역할 수정
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, auth_type: string) => {
    const {
        values: [role_id],
        guild_id,
    } = interaction;

    await interaction.differ({ ephemeral: true });
    if (!guild_id) return;

    upsertAuthBorde(
        {
            role_id,
        },
        {
            guild_id,
            type: auth_type,
        }
    )
        .then(async () => {
            interaction.reply({ content: '역할이 수정되었습니다.', ephemeral: true });
        })
        .catch(() => {
            interaction.reply({ content: '역할 수정에 실패하였습니다.', ephemeral: true });
        });
};
