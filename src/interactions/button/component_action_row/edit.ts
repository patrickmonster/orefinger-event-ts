import { MessageInteraction } from 'interactions/message';

import { selectComponentPagingMenuByKey } from 'components/systemComponent';
import {
    ParseInt,
    copyComponentActionRow,
    getComponentActionRowEditByModel,
    getComponentRowDtilByEmbed,
    getComponentRowEditByOrder,
    updateComponentActionRowConnect,
    upsertComponentActionRowConnect,
} from 'controllers/component';
import { ButtonStyle, ComponentType } from 'discord-api-types/v10';

/**
 *
 * 컴포넌트 action row 수정
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, component_row_id: string, type: string, component_id: string) => {
    const {
        component,
        message: { components },
        custom_id,
    } = interaction;
    switch (type) {
        case 'reload': {
            const { embed } = await getComponentRowDtilByEmbed(component_row_id);
            interaction.edit({
                embeds: [embed],
            });
            break;
        }
        case 'option':
            interaction.reply({
                components: await selectComponentPagingMenuByKey(
                    {
                        custom_id: `component_action_row edit ${component_row_id} option`,
                        placeholder: '컴포넌트를 선택해주세요!',
                        disabled: false,
                        max_values: 5,
                        min_values: 0,
                    },
                    `
SELECT JSON_OBJECT( IF(REGEXP_LIKE(c.emoji, '^[0-9]+$'), 'id', 'name'), IF( c.emoji < '' OR c.emoji IS NULL, '▫', c.emoji)) AS emoji
    , CAST(c.component_id AS CHAR) AS value
    , CONCAT( c.component_id , ']' , name) AS label
    , concat(ct.tag, "] ", name) AS  description
    , IF(carc.use_yn = 'Y', TRUE, FALSE ) AS \`default\`
FROM component c
LEFT JOIN component_type ct ON c.type_idx = ct.type_idx  
LEFT JOIN component_action_row_connect carc ON carc.component_row_id = ? AND carc.component_id = c.component_id AND carc.use_yn ='Y'
                `,
                    ParseInt(component_row_id)
                ),
            });
            break;
        case 'order': // 정렬상태 수정
            console.log(component_row_id, type, component_id);

            if (!component_id) {
                interaction.reply({
                    ephemeral: true,
                    components: [await getComponentRowEditByOrder(component_row_id, `component_action_row edit ${component_row_id} order`)],
                });
            } else {
                if (!component) return; // 있을수 없음
                // 이전에 선택된 항목개수
                const selectItemCount = component.components.filter(v => {
                    if (v.type !== ComponentType.Button || v.style == ButtonStyle.Link) return false;
                    // 클릭한 버튼은 비활성화
                    if (v.custom_id == custom_id) v.disabled = true;

                    return v.disabled;
                }).length;

                // 첫 선택시 모두 초기화
                if (selectItemCount <= 1) await updateComponentActionRowConnect(component_row_id, null, { sort_number: 99 });
                // 해당 번호 할당
                await upsertComponentActionRowConnect({
                    component_row_id: parseInt(component_row_id),
                    component_id: parseInt(component_id),
                    sort_number: selectItemCount,
                });

                interaction.edit({ components });
            }
            break;
        case 'copy': {
            // 복사버튼
            const { insertId } = await copyComponentActionRow(component_row_id);
            interaction.reply({ content: '복사되었습니다. - ' + insertId, ephemeral: true });
            break;
        }
        case 'edit': // 수정버튼
            // 수정버튼
            const model = await getComponentActionRowEditByModel(component_row_id);

            // 모달처리
            interaction.model({
                ...model,
                custom_id: `component_action_row edit ${component_row_id}`,
            });
            break;
        //
    }
};
