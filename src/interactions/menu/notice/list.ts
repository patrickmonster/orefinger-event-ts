import { MessageMenuInteraction } from 'interactions/message';

import { createComponentSelectMenuByComponentPagingMenuByKey } from 'components/systemComponent';
import QUERY from 'controllers/component/noticeListQuerys';
import { createSecondaryButton } from 'utils/discord/component';
/**
 *
 * 가이드 호출 - 디비처리용
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction) => {
    const {
        values: [notice_type],
        guild_id,
    } = interaction;

    if (!guild_id) return;

    interaction.reply({
        components: await createComponentSelectMenuByComponentPagingMenuByKey(
            {
                custom_id: `notice detail ${notice_type}`,
                placeholder: '설정하실 알림을 선택해주세요.',
                button: createSecondaryButton(`notice add ${notice_type}`, {
                    label: '알림을 검색하여 추가',
                    emoji: { name: '🔍' },
                }),
            },
            QUERY.SelectNoticeDashbordByNoticeId,
            notice_type,
            guild_id
        ),
    });
};
