import { MessageMenuInteraction } from 'fastify-discord';

/**
 *
 * 가이드 호출 - 디비처리용
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, noticeId: string) => {
    const {
        values: [notice_type],
        guild_id,
    } = interaction;

    if (!guild_id) return;

    // interaction.reply({
    //     ephemeral: true,
    //     content: '해당 기능은 현재 준비중입니다...!',
    // });
};
