import { getComponentTypeList, selectComponentDtilByEmbed, selectComponentYnMenu } from 'controllers/component';
import { IReply } from 'plugins/discord';
import { createStringSelectMenu } from 'utils/discord/component';
import { editerComponent } from './systemComponent';

export const getComponentEditor = async (interaction: IReply, component_id: string | number) => {
    await interaction.differ({ ephemeral: true });
    const embed = await selectComponentDtilByEmbed(component_id);

    if (!embed) {
        interaction.reply({ content: '해당 메세지를 찾을 수 없습니다.', ephemeral: true });
    } else {
        const id = `component edit ${component_id}`;

        const ynMenu = await selectComponentYnMenu(component_id, 'component');
        interaction.reply({
            content: `컴포넌트 정보를 수정합니다. - ${component_id}`,
            embeds: [embed],
            ephemeral: true,
            components: [
                editerComponent(id, []),
                createStringSelectMenu(`${id} select`, {
                    max_values: 1,
                    min_values: 1,
                    placeholder: '변경',
                    options: [
                        { label: '기본설정', value: 'base' },
                        { label: '텍스트', value: 'text' },
                    ],
                }),
                createStringSelectMenu(`${id} type`, {
                    max_values: 1,
                    min_values: 1,
                    placeholder: '컴포넌트 타입을 선택해주세요.',
                    options: await getComponentTypeList(component_id),
                }),
                createStringSelectMenu(`${id} yn`, {
                    max_values: ynMenu.length,
                    min_values: 0,
                    placeholder: '컴포넌트 활성여부를 선택해주세요.',
                    options: await getComponentTypeList(component_id),
                }),
            ],
        });
    }
};
