import { MessageMenuInteraction } from 'interactions/message';

/**
 *
 * 가이드 호출 - 디비처리용
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, target: string) => {
    const {
        values: [select_id],
        component,
        message: {
            embeds: [embed],
            components,
        },
    } = interaction;

    switch (target) {
        case 'channel': {
            // 채널 변경 메뉴

            break;
        }
        default:
            interaction.reply({ content: '컴포넌트 수정에 실패했습니다.', ephemeral: true });
            break;
    }
};
