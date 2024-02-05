import { selectNoticeDetailEditByModel } from 'controllers/notice';
import { MessageInteraction } from 'interactions/message';

/**
 *
 * 알림 수정 버튼
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, noticeId: string, modeType: string) => {
    switch (modeType) {
        case 'edit': {
            const model = await selectNoticeDetailEditByModel(noticeId);

            interaction.model({
                ...model,
                custom_id: `notice edit ${noticeId}`,
            });
        }
    }
};
