import { addOrder, selectPointDetail } from 'controllers/point';
import { MessageInteraction } from 'interactions/message';
import { getMessageId, ParseInt } from 'utils/object';

/**
 * 상품구매
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, idx: string) => {
    const { guild_id, message, channel, member, user } = interaction;

    if (!guild_id || !member) return; // 길드만 가능한 명령어 입니다.

    const userId = user?.id || member?.user.id;

    await interaction.differ({ ephemeral: true });

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

    if (isSuccess)
        interaction.reply({
            content: '상품을 구매하였습니다.',
            ephemeral: true,
        });
    else
        interaction.reply({
            content: '상품 구매에 실패하였습니다.',
            ephemeral: true,
        });
};
