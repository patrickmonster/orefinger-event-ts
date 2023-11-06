import { selectComponentPagingMenuByKey } from 'components/systemComponent';
import { getComponentBaseEditByModel, getComponentDtilByEmbed, updateComponent, upsertComponentOptionConnect } from 'controllers/component';
import { APIStringSelectComponent } from 'discord-api-types/v10';
import { MessageMenuInteraction } from 'interactions/message';
import { ComponentCreate, ComponentOptionConnect } from 'interfaces/component';

/**
 *
 * 가이드 호출 - 디비처리용
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, component_id: string, target: string) => {
    const {
        custom_id,
        values: [select_id],
        component,
        message: {
            embeds: [embed],
            components,
        },
    } = interaction;

    switch (target) {
        case 'type': // 타입 변경 메뉴
            try {
                if (!component) throw new Error('컴포넌트를 찾을 수 없습니다.');

                const componentsMenu = component.components[0] as APIStringSelectComponent;

                componentsMenu.options.forEach(option => ({ ...option, default: option.value === select_id }));
                const label = componentsMenu.options?.find(option => option.value === select_id)?.label;
                await updateComponent(component_id, { type_idx: parseInt(select_id) });
                await interaction.edit({
                    embeds: [
                        {
                            ...embed,
                            author: { name: label ?? '컴포넌트 타입 변경' },
                        },
                    ],
                    components,
                });
            } catch (error) {
                interaction.reply({ content: '타입 변경에 실패했습니다.', ephemeral: true });
            }
            break;
        case 'yn': {
            const { values } = interaction;

            try {
                if (!component) throw new Error('컴포넌트를 찾을 수 없습니다.');
                const componentsMenu = component.components[0] as APIStringSelectComponent;

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
                if (!component) throw new Error('컴포넌트를 찾을 수 없습니다.');
                const componentsMenu = component.components[0] as APIStringSelectComponent;

                await upsertComponentOptionConnect(
                    componentsMenu.options.map(({ value }) => ({
                        component_id: parseInt(component_id),
                        option_id: parseInt(value),
                        use_yn: values.includes(value) ? 'Y' : 'N',
                    })) as ComponentOptionConnect[]
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
                        components: await selectComponentPagingMenuByKey(
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
