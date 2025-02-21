import { cancelOrder } from 'controllers/point';
import { MessageInteraction } from 'fastify-discord';

/**
 * 상품을 추가합니다.
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, orderId: string, type: string) => {
    const { guild_id, message, channel, member } = interaction;

    if (!guild_id || !member) return; // 길드만 가능한 명령어 입니다.

    switch (type) {
        case 'succes': {
            interaction.edit({ content: '정산 처리되었습니다.', components: [] });
            break;
        }
        case 'fail': {
            try {
                await cancelOrder(orderId, guild_id);
                interaction.edit({ content: '포인트가 환불 되었습니다.', components: [] });
            } catch (e) {
                interaction.edit({ content: '환불 과정에서 문제가 발생하였습니다...!', components: [] });
            }
            break;
        }
        // case 'list': {
        //     break;
        // }
    }
};
