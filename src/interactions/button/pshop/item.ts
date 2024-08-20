import { selectComponentPagingMenuByKey } from 'components/systemComponent';
import { selectPointDetailByEmbed, selectPshopItemEditByModel, upsertPshopItem } from 'controllers/point';
import { MessageInteraction } from 'interactions/message';
import { createActionRow, createToggleButton } from 'utils/discord/component';
import { ParseInt } from 'utils/object';

import QUERY from 'controllers/component/pointShopListQuerys';

/**
 * 상품을 추가합니다.
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, idx: string, type: string) => {
    const { guild_id, message, channel, member } = interaction;

    if (!guild_id || !member) return; // 길드만 가능한 명령어 입니다.

    switch (type) {
        case 'edit': {
            const modal = await selectPshopItemEditByModel(`${idx}`);
            if (!modal) {
                return interaction.reply({
                    content: '상품이 존재하지 않습니다.',
                    ephemeral: true,
                });
            }

            interaction.model({
                ...modal,
                custom_id: `pshop edit ${idx}`,
            });
            break;
        }
        case 'enable':
        case 'disable': {
            await upsertPshopItem(
                {
                    use_yn: type == 'enable' ? 'Y' : 'N',
                    update_user: member.user.id,
                },
                {
                    idx: ParseInt(idx),
                }
            );

            const { embed, use_yn } = await selectPointDetailByEmbed(guild_id, {
                idx: ParseInt(idx),
            });
            const button = createToggleButton(
                use_yn,
                [`pshop item ${idx} enable`, `pshop item ${idx} disable`],
                ['활성화', '비활성화']
            );

            await interaction.edit({
                embeds: [embed],
                components: [message.components?.[0], createActionRow(button)].filter(v => {
                    return v !== undefined;
                }),
            });
            break;
        }
        case 'orders': {
            // GuildShopOrderItemByMenuListQuery
            interaction.reply({
                ephemeral: true,
                components: await selectComponentPagingMenuByKey(
                    {
                        custom_id: `pshop order ${idx}`,
                        placeholder: '주문내역을 선택 해 주세요',
                        disabled: false,
                        max_values: 1,
                        min_values: 1,
                    },
                    QUERY.GuildShopOrderItemByMenuListQuery,
                    guild_id
                ),
            });
            break;
        }
    }
};
