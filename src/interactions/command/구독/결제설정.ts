import { createComponentSelectMenuByComponentPagingMenuByKey } from 'components/systemComponent';
import { AppChatInputInteraction } from 'interactions/app';

import QUERY from 'controllers/component/embedListQuerys';
import { createChatinputCommand } from 'utils/discord/component';

export const exec = async (interaction: AppChatInputInteraction) => {
    const { guild_id } = interaction;

    await interaction.differ({ ephemeral: true });
    if (!guild_id) return;

    interaction.reply({
        content: `설정하거나, 수정하실 인증을 선택해주세요!`,
        components: await createComponentSelectMenuByComponentPagingMenuByKey(
            {
                custom_id: 'rules list',
                placeholder: '수정하시거나, 제작하실 인증을 선택해주세요!',
            },
            QUERY.SelectAuthDashbord,
            guild_id
        ),
    });
};

const api = createChatinputCommand(
    {
        description: '소셜 인증을 설정합니다',
    },
    __filename
);

export const isAdmin = true; // 봇 관리자만 사용 가능
export default api;
