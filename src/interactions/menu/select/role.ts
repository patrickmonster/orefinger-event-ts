import { MessageMenuInteraction } from 'fastify-discord';

import authTusuSelect from 'components/authTusuSelect';

/**
 *
 * 사용자 정보 선택 - 트수인증
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, role_id: string) => {
    const {
        user,
        values: [user_id],
        member,
        guild_id,
    } = interaction;

    await interaction.differ({ ephemeral: true });

    const userId = user?.id || member?.user.id;

    await authTusuSelect(interaction, guild_id || '', userId || '0', user_id, role_id);

    // const message = await selectMessage(user?.id || 0, id);
    // if (!message) return;

    // await interaction.re(message);
};

//  해당 명령은 등록 하지 않는 명령 입니다.
export default {
    // alias: ['출석'],
};
