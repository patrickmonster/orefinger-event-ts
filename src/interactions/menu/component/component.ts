import { MessageMenuInteraction } from 'interactions/message';

import { editerComponent } from 'components/systemComponent';
import { getComponentDtilByEmbed, getComponentTypeList, getComponentYnMenu } from 'controllers/component';
import { ButtonStyle, ComponentType } from 'discord-api-types/v10';

/**
 *
 * 가이드 호출 - 디비처리용
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction) => {
    const {
        component,
        message: { components },
        values: [component_id],
    } = interaction;

    await interaction.differ({ ephemeral: true });
    const data = await getComponentDtilByEmbed(component_id);

    if (!data) {
        interaction.reply({ content: '해당 메세지를 찾을 수 없습니다.', ephemeral: true });
    } else {
        const { embed, type } = data;
        const id = `component edit ${component_id}`;

        const ynMenu = await getComponentYnMenu(component_id, 'component');
        await interaction.edit({ components });

        interaction.follow({
            content: `컴포넌트 정보를 수정합니다. - ${component_id}`,
            embeds: [embed],
            ephemeral: true,
            components: [
                editerComponent(id, [
                    {
                        type: ComponentType.Button,
                        style: ButtonStyle.Success,
                        label: '하위 옵션 수정',
                        custom_id: `${id} option`,
                        disabled: ComponentType.StringSelect != type,
                    },
                    {
                        type: ComponentType.Button,
                        style: ButtonStyle.Success,
                        label: '텍스트 수정',
                        custom_id: `${id} text`,
                    },
                    {
                        type: ComponentType.Button,
                        label: '새로고침',
                        style: ButtonStyle.Danger,
                        custom_id: `${id} reload`,
                    },
                ]),
                // editerComponentComponentTemplate(id),
                {
                    type: ComponentType.ActionRow,
                    components: [
                        {
                            type: ComponentType.StringSelect,
                            custom_id: `${id} type`,
                            max_values: 1,
                            min_values: 1,
                            placeholder: '컴포넌트 타입을 선택해주세요.',
                            options: await getComponentTypeList(type),
                        },
                    ],
                },
                {
                    type: ComponentType.ActionRow,
                    components: [
                        {
                            type: ComponentType.StringSelect,
                            custom_id: `${id} yn`,
                            max_values: ynMenu.length,
                            min_values: 0,
                            placeholder: '컴포넌트 타입을 선택해주세요.',
                            options: ynMenu,
                        },
                    ],
                },
            ],
        });
    }
};
