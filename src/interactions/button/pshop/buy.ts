import { MessageInteraction } from 'interactions/message';

/**
 * 상품구매
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, idx: string) => {
    const { guild_id, message, channel, member } = interaction;

    if (!guild_id || !member) return; // 길드만 가능한 명령어 입니다.

    //
    interaction.differ({ ephemeral: true });
};
