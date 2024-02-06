import { ParseInt, upsertNotice } from 'controllers/notice';
import { MessageMenuInteraction } from 'interactions/message';
import { getChzzkAPI } from 'utils/naverApiInstance';

const chzzk = getChzzkAPI('v1');

const hashIdChzzk = new RegExp('^[a-zA-Z0-9]{32}$');
/**
 * 사용자를 검색합니다
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, values: Record<string, string>, noticeId: string) => {
    const { guild_id, channel } = interaction;
    if (!guild_id) return;

    await upsertNotice({
        notice_id: ParseInt(noticeId),
        ...values,
    });

    interaction.reply({
        content: '알림이 수정되었습니다.',
        ephemeral: true,
    });
};
