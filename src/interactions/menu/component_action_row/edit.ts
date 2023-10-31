import { MessageMenuInteraction } from 'interactions/message';

/**
 *
 * 가이드 호출 - 디비처리용
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, component_id: string, target: string) => {
    const {
        user,
        custom_id,
        values: [select_id],
        message: {
            embeds: [embed],
            components,
        },
    } = interaction;

    switch (target) {
        case 'option': {
        }
        default:
            interaction.reply({ content: '컴포넌트 수정에 실패했습니다.', ephemeral: true });
            break;
    }
};
