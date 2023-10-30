import { MessageMenuInteraction } from 'interactions/message';

import { editerComponent } from 'components/systemComponent';
import { getComponentRowDtilByEmbed } from 'controllers/component';
import { ComponentType } from 'discord-api-types/v10';

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
    const data = await getComponentRowDtilByEmbed(component_id);

    if (!data) {
        interaction.reply({ content: '해당 메세지를 찾을 수 없습니다.', ephemeral: true });
    } else {
        const { embed, type } = data;
        const id = `component_action_row edit ${component_id}`;

        interaction.reply({
            content: `컴포넌트 정보를 수정합니다. - ${component_id}`,
            embeds: [embed],
            ephemeral: true,
            components: [
                editerComponent(id, []),
                {
                    // 하위 옵션 수정
                    type: ComponentType.ActionRow,
                    components: [
                        {
                            custom_id: `${id} option`,
                            type: ComponentType.StringSelect,
                            placeholder: '하위 옵션 수정',
                            options: [0, 1, 2, 3, 4].map(value => ({
                                label: `${value}`,
                                value: `${value}`,
                                description: `${value}항목 수정`,
                            })),
                        },
                    ],
                },
            ],
        });
    }
};
