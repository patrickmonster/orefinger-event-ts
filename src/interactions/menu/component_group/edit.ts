import { selectComponentMenuByKey } from 'components/systemComponent';
import {
    UpdateYNConnection,
    getComponentBaseEditByModel,
    getComponentDtilByEmbed,
    updateComponent,
    updateComponentOptionConnect,
} from 'controllers/component';
import { APIStringSelectComponent } from 'discord-api-types/v10';
import { MessageMenuInteraction } from 'interactions/message';
import { ComponentCreate } from 'interfaces/component';

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
        case 'yn': {
            const { values } = interaction;

            try {
                const componentActionLow = components?.find(component =>
                    component.components.find(component => 'custom_id' in component && component?.custom_id === custom_id)
                );
                if (!componentActionLow) throw new Error('컴포넌트를 찾을 수 없습니다.');
                const componentsMenu = componentActionLow.components[0] as APIStringSelectComponent;

                await updateComponent(
                    component_id,
                    componentsMenu.options.reduce((out, option, idx) => {
                        const { value } = option;

                        option.default = values.includes(value);
                        return { ...out, [value]: values.includes(value) ? 'Y' : 'N' };
                    }, {}) as Partial<ComponentCreate>
                );

                const { embed } = await getComponentDtilByEmbed(component_id);

                interaction.edit({
                    embeds: [embed],
                    components,
                });
            } catch (error) {
                interaction.reply({ content: '타입 변경에 실패했습니다.', ephemeral: true });
            }
            break;
        }
        case 'option': {
            const { values } = interaction;
            // 컴포넌트 하위 옵션 변경
            try {
                const componentActionLow = components?.find(component =>
                    component.components.find(component => 'custom_id' in component && component?.custom_id === custom_id)
                );
                if (!componentActionLow) throw new Error('컴포넌트를 찾을 수 없습니다.');
                const componentsMenu = componentActionLow.components[0] as APIStringSelectComponent;

                await updateComponentOptionConnect(
                    component_id,
                    componentsMenu.options.map(({ value }) => ({
                        option_id: parseInt(value),
                        value: values.includes(value) ? 'Y' : 'N',
                    })) as UpdateYNConnection[]
                );

                interaction.reply({ content: '옵션 변경에 성공했습니다.', ephemeral: true });
            } catch (error) {
                interaction.reply({ content: '옵션 변경에 실패했습니다.', ephemeral: true });
            }
        }
        case 'select': {
            switch (select_id) {
                case 'base': // name / custom_id / value / min_length / max_length
                    const model = await getComponentBaseEditByModel(component_id);

                    // 모달처리
                    interaction.model({
                        ...model,
                        custom_id: `component edit ${component_id}`,
                    });
                    break;
                case 'text': // label_id
                    // 텍스트 메뉴 선택 (페이징)

                    interaction.reply({
                        ephemeral: true,
                        content: `${component_id}] 라벨변경`,
                        components: await selectComponentMenuByKey(
                            {
                                custom_id: `component edit ${component_id} text`,
                                placeholder: '적용하실 라벨을 선택해 주세요.',
                                disabled: false,
                                max_values: 1,
                                min_values: 0,
                            },
                            `
SELECT CAST(a.text_id AS CHAR) AS value
    , a.tag AS label
    , LEFT(a.message, 100) AS description
    , IF(a.text_id = ( SELECT label_id FROM component c WHERE 1=1 AND c.component_id = ? ), true, false) AS \`default\`
FROM text_message a
WHERE parent_id IS NULL 
                            `,
                            component_id
                        ),
                    });
                    break;
            }
            break;
        }
        case 'text':
            {
                await updateComponent(component_id, { label_id: parseInt(select_id) });
                const { embed } = await getComponentDtilByEmbed(component_id);
                interaction.reply({
                    content: `변경된 렌더링 - ${component_id}`,
                    embeds: [embed],
                    ephemeral: true,
                });
            }
            break;
        default:
            interaction.reply({ content: '컴포넌트 수정에 실패했습니다.', ephemeral: true });
            break;
    }
};
