import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';

import { selectComponentPagingMenuByKey } from 'components/systemComponent';
import QUERY from 'controllers/component/pointShopListQuerys';
import { getPoint } from 'controllers/point';
import { createChatinputCommand } from 'utils/discord/component';

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    const { user, member } = interaction;

    const userId = user?.id || member?.user.id;

    const mount = selectOption.get<number>('포인트');
    const point = await getPoint(userId || '');

    interaction.reply({
        ephemeral: true,
        content: `현재 포인트: ${point}`,
        components: await selectComponentPagingMenuByKey(
            {
                custom_id: `pshop list ${mount}`,
                placeholder: '원하시는 상품을 선택 해 주세요',
                disabled: false,
                max_values: 5,
                min_values: 0,
            },
            QUERY.GuildShopByMenuListQuery
        ),
    });
};

const api = createChatinputCommand(
    {
        description: '포인트 상점을 이용하여 상품을 진열합니다.',
        options: [],
        dm_permission: true,
    },
    __filename
);
export default api;
