import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';
import { createChatinputSubCommand, createPrimaryButton } from 'utils/discord/component';

import { createComponentSelectMenuByComponentPagingMenuByKey } from 'components/systemComponent';
import QUERY from 'controllers/component/embedListQuerys';

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    const { guild_id, user, member } = interaction;

    await interaction.differ({ ephemeral: true });
    if (!guild_id) return;

    const user_id = user?.id || member?.user.id;

    interaction.reply({
        components: await createComponentSelectMenuByComponentPagingMenuByKey(
            {
                custom_id: 'qna list',
                placeholder: '데시보드를 선택해 주세요',
                button: createPrimaryButton('embed create', {
                    label: '데시보드 생성하기',
                }),
            },
            QUERY.EmbedUserByMenuListQuery(user_id)
        ),
    });
};

const api = createChatinputSubCommand(
    {
        description: '질문/ 응답을 생성 및 관리합니다',
    },
    __filename
);

export const isAdmin = false; // 봇 관리자만 사용 가능
export default api;
