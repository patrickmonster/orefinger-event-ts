import { MessageInteraction } from 'fastify-discord';

/**
 *
 * 기본 명령 모음
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, command: string) => {
    const { user, guild_id } = interaction;

    await interaction.differ({ ephemeral: true });

    switch (command) {
        case 'cancel':
            await interaction.remove();
            break;
        default:
            break;
    }
};
