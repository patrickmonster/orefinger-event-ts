import { MessageInteraction } from 'interactions/message';
import { createActionRow, createDangerButton, createSuccessButton } from 'utils/discord/component';

/**
 * 답변을 생성합니다.
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, amount: number, sqlcode: string) => {
    const { guild_id, message, channel, member } = interaction;

    if (!guild_id || !member) return; // 길드만 가능한 명령어 입니다.
    //

    interaction.reply({
        embeds: [
            {
                title: '결제 확인',
                description: `
해당 상품은 유료 상품입니다!
등록된 결제 수단을 통하여 결제가 진행됩니다.

금액 : ${amount}원

위 금액으로 결제를 진행하시겠습니까?
                `,
            },
        ],
        components: [
            createActionRow(
                createSuccessButton(`paymont confirm ${amount}`, {
                    label: '결제 확인',
                }),
                createDangerButton('confirm', {
                    label: '취소',
                })
            ),
        ],
        ephemeral: true,
    });
};
