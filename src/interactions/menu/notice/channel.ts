import { deleteOrInsertNoticeChannels } from 'controllers/notice';
import { MessageMenuInteraction } from 'interactions/message';

/**
 * 알림 채널 변경용
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, notice_id: string) => {
    const {
        values: channels,
        message: {
            embeds: [embed],
            components,
        },
        guild_id,
    } = interaction;
    if (!guild_id) return;

    await deleteOrInsertNoticeChannels(notice_id, guild_id, channels);

    interaction.reply({
        content: '알림 채널이 변경되었습니다.',
        ephemeral: true,
    });
};
