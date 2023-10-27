import { selectComponentMenuByKey } from 'components/systemComponent';
import { getComponentBaseEditByModel, getComponentDtilByEmbed, updateComponent } from 'controllers/component';
import { APIStringSelectComponent } from 'discord-api-types/v10';
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
        case 'type': // 타입 변경 메뉴
            try {
                const componentActionLow = components?.find(component =>
                    component.components.find(component => 'custom_id' in component && component?.custom_id === custom_id)
                );
                if (!componentActionLow) throw new Error('컴포넌트를 찾을 수 없습니다.');

                const componentsMenu = componentActionLow.components[0] as APIStringSelectComponent;

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
        case 'select':
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
                                min_values: 1,
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
                case 'type': // use_yn / disabled_yn / style_id
                    // 옵션 메뉴 선택
                    break;
            }
            break;
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
