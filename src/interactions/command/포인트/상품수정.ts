import { AppChatInputInteraction } from 'fastify-discord';
import { SelectOptionType } from 'interactions/app';

import { selectComponentPagingMenuByKey } from 'components/systemComponent';
import QUERY from 'controllers/component/pointShopListQuerys';
import { createChatinputCommand, createSuccessButton } from 'utils/discord/component';

//
// private getMessageId(time: number, userId: string) {
//     let snowflake = BigInt(time - 1_420_070_400_000) & ((BigInt(1) << BigInt(41)) - BigInt(1)); // 41 bits for timestamp
//     snowflake = snowflake << BigInt(22); // shift 22 bits
//     snowflake |= BigInt(getServiceId(userId, 1023) & ((1 << 10) - 1)) << BigInt(12); // 10 bits for node id
//     snowflake |= BigInt(getServiceId(this.chatChannelId, 1023) & ((1 << 12) - 1)); // 12 bits for counter

//     return snowflake.toString();
// }

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    const { guild_id } = interaction;

    if (!guild_id) {
        return interaction.reply({ content: '서버에서만 사용 가능한 명령어 입니다.', ephemeral: true });
    }

    interaction.reply({
        ephemeral: true,
        components: await selectComponentPagingMenuByKey(
            {
                custom_id: `pshop list`,
                placeholder: '수정을 원하시는 상품을 선택 해 주세요',
                disabled: false,
                max_values: 1,
                min_values: 1,
                button: createSuccessButton('pshop create', {
                    label: '상품 추가하기',
                    emoji: { name: '➕' },
                }),
            },
            QUERY.GuildShopByMenuListQuery,
            guild_id
        ),
    });
};

const api = createChatinputCommand(
    {
        description: '상품을 관리합니다.',
        options: [],
        dm_permission: true,
    },
    __filename
);
export default api;
