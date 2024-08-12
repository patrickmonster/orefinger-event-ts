import { MessageMenuInteraction } from 'interactions/message';

import { selectEmbedAuthBord } from 'components/ruleBord';

/**
 *
 * 사용자 소셜 로그인 데시보드 설정
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction) => {
    const {
        values: [auth_type],
        guild_id,
    } = interaction;

    if (!guild_id) return;

    await selectEmbedAuthBord(interaction, guild_id, auth_type);
};
