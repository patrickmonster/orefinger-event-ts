import { MessageMenuInteraction } from 'interactions/message';

/**
 * 질의 응답
 *  도움말을 출력 합니다.
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, embedId: string) => {
    const { values, guild_id } = interaction;

    if (!guild_id) return;

    if (!values.length) {
        return interaction.remove();
    }
};
