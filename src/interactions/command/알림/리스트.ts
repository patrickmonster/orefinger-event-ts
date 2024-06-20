import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';

import { createComponentSelectMenuByComponentPagingMenuByKey } from 'components/systemComponent';
import QUERY from 'controllers/component/noticeListQuerys';
import { createChatinputCommand } from 'utils/discord/component';

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    const { guild_id } = interaction;

    if (!guild_id) return;

    interaction.reply({
        ephemeral: true,
        components: await createComponentSelectMenuByComponentPagingMenuByKey(
            {
                custom_id: `notice detail `,
                placeholder: '설정하실 알림을 선택해주세요.',
            },
            QUERY.SelectNoticeDashbordByGuildId,
            guild_id
        ),
    });
};

const api = createChatinputCommand(
    {
        description: '소셜 알림을 설정합니다.',
    },
    __filename
);
export default api;
