import { MessageInteraction } from 'interactions/message';

/**
 * 질문 응답
 *  도움말을 출력 합니다.
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, embedId: string) => {
    const { guild_id } = interaction;

    if (!guild_id) return;

    interaction.reply({
        ephemeral: true,
        content: '도움말을 출력합니다.',
    });
};
