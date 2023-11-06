import { MessageMenuInteraction } from 'interactions/message';

import { editerComponent } from 'components/systemComponent';
import { selectComponentRowDtilByEmbed } from 'controllers/component';
import { ButtonStyle, ComponentType } from 'discord-api-types/v10';

/**
 *
 * action row 수정
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction) => {
    const {
        user,
        values: [component_id],
    } = interaction;

    await interaction.differ({ ephemeral: true });
    const data = await selectComponentRowDtilByEmbed(component_id);

    if (!data) {
        interaction.reply({ content: '해당 메세지를 찾을 수 없습니다.', ephemeral: true });
    } else {
        const { embed } = data;
        const id = `component_action_row edit ${component_id}`;

        interaction.reply({
            content: `컴포넌트 정보를 수정합니다. - ${component_id}`,
            embeds: [embed],
            ephemeral: true,
            components: [
                editerComponent(id, [
                    {
                        type: ComponentType.Button,
                        label: '하위 옵션 수정',
                        style: ButtonStyle.Success,
                        custom_id: `${id} option`,
                    },
                    {
                        type: ComponentType.Button,
                        label: '정렬 수정',
                        style: ButtonStyle.Success,
                        custom_id: `${id} order`,
                    },
                    {
                        type: ComponentType.Button,
                        label: '새로고침',
                        style: ButtonStyle.Danger,
                        custom_id: `${id} reload`,
                    },
                ]),
            ],
        });
    }
};
