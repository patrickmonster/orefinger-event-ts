import { getPoint, selectPointDetail } from 'controllers/point';
import { MessageMenuInteraction } from 'interactions/message';
import { createActionRow, createSuccessButton } from 'utils/discord/component';
import { ParseInt } from 'utils/object';

/**
 *
 * 상품 구매여부 확인
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction) => {
    const {
        values: [idx],
        guild_id,
        user,
        member,
    } = interaction;

    const userId = user?.id || member?.user.id;

    if (!guild_id) return;

    const point = await getPoint(userId || '');

    const [item] = await selectPointDetail(guild_id, { idx: ParseInt(idx) });

    if (!item) {
        return interaction.reply({
            content: '상품이 존재하지 않습니다.',
            ephemeral: true,
        });
    }

    interaction.reply({
        embeds: [
            {
                title: '상품 구매',
                color: 0x00ff00,
                description: `
'${item.name}'을(를) 구매하시겠습니까?
\`\`\`${item.detail}\`\`\`

현재 포인트: ${point}
구매 포인트: ${item.point}

구매 후 남은 포인트 : ${point - item.point}
* 포인트가 부족할 경우 구매가 불가능합니다.
                `,
                fields: [
                    {
                        name: '차감 포인트',
                        value: `${item.point}`,
                    },
                ],
            },
        ],
        components: [
            createActionRow(
                createSuccessButton(`pshop buy ${idx}`, {
                    label: '구매하기',
                    emoji: { name: '💳' },
                    disabled: point < item.point,
                })
            ),
        ],
        ephemeral: true,
    });
};
