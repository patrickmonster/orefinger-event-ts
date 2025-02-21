import { messageCreate } from 'components/discord';
import { addOrder, selectPointDetail, selectPointGuild } from 'controllers/point';
import { MessageInteraction } from 'fastify-discord';
import { createActionRow, createDangerButton, createSuccessButton } from 'utils/discord/component';
import { getMessageId, ParseInt } from 'utils/object';

/**
 * 상품구매
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, idx: string) => {
    const { guild_id, message, channel, member, user } = interaction;

    if (!guild_id || !member) return; // 길드만 가능한 명령어 입니다.

    const userId = user?.id || member?.user.id;

    const [item] = await selectPointDetail(guild_id, { idx: ParseInt(idx) });

    if (!item) {
        return interaction.reply({
            content: '상품이 존재하지 않습니다.',
            ephemeral: true,
        });
    }

    // 포인트 차감
    const orderId = getMessageId(Date.now(), userId);
    const isSuccess = await addOrder(
        {
            order_id: orderId,
            auth_id: userId || '',
            point: item.point,
            name: item.name,
            item_idx: item.idx,
        },
        guild_id
    );

    if (isSuccess) {
        await interaction.remove();
        await interaction.reply({
            content: '상품을 구매하였습니다.',
            ephemeral: true,
        });

        const target = await selectPointGuild(guild_id);

        if (!target || !target.channel_id) return;

        messageCreate(target.channel_id, {
            content: '상품 구매 알림',
            embeds: [
                {
                    title: '상품 구매',
                    description: `
'${item.name}'을(를) 구매하였습니다.
\`\`\`${item.detail}\`\`\`
                    `,
                    color: 0x00ff00,
                    fields: [
                        {
                            name: '구매자',
                            value: `<@${userId}>`,
                        },
                        {
                            name: '차감 포인트',
                            value: `${item.point}`,
                        },
                    ],
                },
            ],
            components: [
                createActionRow(
                    // createPrimaryButton(`pshop order ${orderId} list`, {
                    //     label: '사용자의 구매이력을 확인합니다.',
                    // }),
                    createSuccessButton(`pshop order ${orderId} succes`, {
                        label: '(정산) 상품을 지급 했습니다.',
                    }),
                    createDangerButton(`pshop order ${orderId} fail`, {
                        label: '(환불) 포인트를 반환합니다.',
                    })
                ),
            ],
        });

        // await sendNoticeByBord(
        //     guild_id,
        //     14,
        //     {
        //         user: `<@${userId}>`,
        //         item: item.name,
        //         point: `${item.point.toLocaleString()}포인트`,
        //     }
        //     // [
        //     //     createActionRow(
        //     //         createSuccessButton(`pshop order ${orderId} succes`, {
        //     //             label: '(정산) 상품을 지급 했습니다.',
        //     //         }),
        //     //         createDangerButton(`pshop order ${orderId} fail`, {
        //     //             label: '(환불) 포인트를 반환합니다.',
        //     //         }),
        //     //         createPrimaryButton(`pshop order ${orderId} list`, {
        //     //             label: '사용자의 구매이력을 확인합니다',
        //     //         })
        //     //     ),
        //     // ]
        // );
    } else
        interaction.reply({
            content: '상품 구매에 실패하였습니다.',
            ephemeral: true,
        });
};
