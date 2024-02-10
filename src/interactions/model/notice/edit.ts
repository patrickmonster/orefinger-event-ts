import { castMessage } from 'components/guild';
import { ParseInt, upsertNotice } from 'controllers/notice';
import { MessageMenuInteraction } from 'interactions/message';

/**
 * 알림을 수정합니다.
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, values: Record<string, string>, noticeId: string) => {
    const { guild_id, channel } = interaction;
    if (!guild_id) return;

    if (values.message) {
        values.message = await castMessage(guild_id, values.message, true);
    }

    await upsertNotice({
        notice_id: ParseInt(noticeId),
        ...values,
    });

    interaction.reply({
        content: '알림이 수정되었습니다.',
        ephemeral: true,
    });
};
