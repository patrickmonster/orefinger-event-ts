import { MessageMenuInteraction } from 'interactions/message';

import { editerComponent } from 'components/systemComponent';
import { selectPointDetailByEmbed } from 'controllers/point';
import { createActionRow, createPrimaryButton, createToggleButton } from 'utils/discord/component';
import { ParseInt } from 'utils/object';
/**
 *
 * 상품 수정
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction) => {
    const {
        values: [idx],
        guild_id,
    } = interaction;

    if (!guild_id) return;

    const { embed, use_yn } = await selectPointDetailByEmbed(guild_id, {
        idx: ParseInt(idx),
    });

    interaction.reply({
        ephemeral: true,
        embeds: [embed],
        components: [
            editerComponent(
                `pshop item ${idx}`,
                [
                    createPrimaryButton(`pshop item ${idx} orders`, {
                        label: '주문내역',
                        emoji: { name: '📦' },
                    }),
                ],
                true,
                {
                    edit: '상품정보수정',
                    copy: '-',
                }
            ),
            createActionRow(
                createToggleButton(
                    use_yn,
                    [`pshop item ${idx} enable`, `pshop item ${idx} disable`],
                    ['활성화', '비활성화']
                )
            ),
        ],
    });
};
