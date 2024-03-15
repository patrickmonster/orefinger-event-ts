import { upsertAttach } from 'controllers/notice';
import { MessageInteraction } from 'interactions/message';

/**
 * 출석체크
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, noticeId: string) => {
    const { guild_id, user, member } = interaction;

    const userId = `${user?.id || member?.user.id}`;

    const a = await upsertAttach(noticeId, userId);
};
