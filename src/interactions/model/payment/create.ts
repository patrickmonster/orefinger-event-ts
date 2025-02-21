import { createPayment } from 'components/paymont';
import { MessageMenuInteraction } from 'fastify-discord';

/**
 *
 * 가이드 호출 - 디비처리용
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, values: Record<string, string>) => {
    //
    const { user, member } = interaction;

    const user_id = user?.id || member?.user.id;
    try {
        const result = await createPayment(`${user_id}`, values);

        if (result) {
            interaction.reply({
                ephemeral: true,
                content: `${values.card_alias} 카드가 생성되었습니다 (${result})`,
            });
        } else {
            interaction.reply({
                ephemeral: true,
                content: '카드 정보를 확인해주세요. - 유효기간이 올바르지 않습니다.',
            });
        }
    } catch (e) {
        interaction.reply({
            ephemeral: true,
            content: '카드 정보를 확인해주세요. - 결제사에서 거부되었습니다',
        });
    }
};
