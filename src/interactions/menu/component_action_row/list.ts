import { MessageMenuInteraction } from 'interactions/message';

import { editerComponent } from 'components/systemComponent';
import { selectComponentRowDtilByEmbed } from 'controllers/component';
import { createSuccessButton } from 'utils/discord/component';

/**
 *
 * action row 수정
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction) => {
    const {
        values: [component_id],
    } = interaction;

    await interaction.differ({ ephemeral: true });
    const embed = await selectComponentRowDtilByEmbed(component_id);

    if (!embed) {
        interaction.reply({ content: '해당 메세지를 찾을 수 없습니다.', ephemeral: true });
    } else {
        const id = `component_action_row edit ${component_id}`;

        interaction.reply({
            content: `컴포넌트 정보를 수정합니다. - ${component_id}`,
            embeds: [embed],
            ephemeral: true,
            components: [
                editerComponent(id, [
                    createSuccessButton(`${id} option`, {
                        label: '하위 옵션 수정',
                    }),
                    createSuccessButton(`${id} order`, {
                        label: '정렬 수정',
                    }),
                    createSuccessButton(`${id} reload`, {
                        label: '새로고침',
                    }),
                ]),
            ],
        });
    }
};
