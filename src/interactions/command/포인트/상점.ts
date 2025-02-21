import { AppChatInputInteraction } from 'fastify-discord';
import { SelectOptionType } from 'interactions/app';

import { selectComponentPagingMenuByKey } from 'components/systemComponent';
import QUERY from 'controllers/component/pointShopListQuerys';
import { getPoint } from 'controllers/point';
import { createChatinputCommand, createUrlButton } from 'utils/discord/component';

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    const { user, member, guild_id } = interaction;

    const userId = user?.id || member?.user.id;

    if (!guild_id) {
        return interaction.reply({ content: '서버에서만 사용 가능한 명령어 입니다.', ephemeral: true });
    }

    const point = await getPoint(userId || '');

    interaction.reply({
        ephemeral: true,
        content: `현재 포인트: ${point}`,
        components: await selectComponentPagingMenuByKey(
            {
                custom_id: `pshop item`,
                placeholder: '원하시는 상품을 선택 해 주세요',
                disabled: false,
                max_values: 1,
                min_values: 1,
                button: createUrlButton('https://orefinger.notion.site/b81d56bf3127421bad0ada0466a2d921', {
                    label: '이거 어떻게 쓰는건가요?',
                    emoji: { name: '❔' },
                }),
            },
            QUERY.GuildShopByMenuListQuery,
            guild_id
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
