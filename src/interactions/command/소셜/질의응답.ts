import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';
import { createChatinputSubCommand } from 'utils/discord/component';

import { createComponentSelectMenuByComponentPagingMenuByKey } from 'components/systemComponent';
import QUERY from 'controllers/component/embedListQuerys';

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    const { guild_id } = interaction;

    await interaction.differ({ ephemeral: true });
    if (!guild_id) return;

    interaction.reply({
        content: `설정하거나, 수정하실 인증을 선택해주세요!`,
        components: await createComponentSelectMenuByComponentPagingMenuByKey(
            {
                custom_id: 'qna list',
                placeholder: '수정하시거나, 제작하실 인증을 선택해주세요!',
            },
            QUERY.SelectAuthDashbord,
            guild_id
        ),
    });
};

const api = createChatinputSubCommand(
    {
        description: '질의/ 응답을 생성 및 관리합니다',
    },
    __filename
);

export const isAdmin = false; // 봇 관리자만 사용 가능
export default api;
