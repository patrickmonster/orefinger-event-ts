import { MessageMenuInteraction } from 'fastify-discord';

/**
 *
 * 인증 생성 / 수정
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction) => {
    const {
        user,
        values: [bord_id],
        guild_id,
    } = interaction;
    if (!guild_id) return;

    await interaction.differ({ ephemeral: true });
};

export default {
    description: '인증 데시보드를 수정/설정 합니다.',
};
