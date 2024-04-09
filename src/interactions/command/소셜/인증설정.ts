import { createComponentSelectMenuByComponentPagingMenuByKey } from 'components/systemComponent';
import { AppChatInputInteraction } from 'interactions/app';

import QUERY from 'controllers/component/embedListQuerys';
import { createChatinputSubCommand } from 'utils/discord/component';

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

const api = createChatinputSubCommand(
    {
        description: '이중 인증을 설정합니다 (계정연동/ 권한 설정)',
    },
    __filename
);

export default api;
