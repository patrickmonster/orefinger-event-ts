import { MessageInteraction } from 'interactions/message';

import { selectComponentMenuByKey } from 'components/systemComponent';
import { ParseInt, copyComponentActionRow, getComponentActionRowEditByModel, getComponentRowEditByOrder } from 'controllers/component';

/**
 *
 * 컴포넌트 action row 수정
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, component_id: string, target: string, idx: string) => {
    switch (target) {
        case 'option':
            interaction.reply({
                components: await selectComponentMenuByKey(
                    {
                        custom_id: `component_action_row edit ${component_id} option`,
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
                    ParseInt(component_id)
                ),
            });
            break;
        case 'order': // 정렬상태 수정
            if (!idx) {
                interaction.reply({
                    components: [await getComponentRowEditByOrder(component_id, `component_action_row edit ${component_id} order`)],
                });
            } else {
                const select = interaction.message.components;
                if (!select || !select[0]) return; // 있을수 없음
                const { components } = select[0];
                // 이전에 선택된 항목개수
                const selectItemCount = components.filter(v => v.disabled).length;

                if (!selectItemCount) {
                    // 초기화 진행
                }

                interaction.reply({ content: '정렬상태 수정' + idx, ephemeral: true });
            }
            break;
        case 'copy': {
            // 복사버튼
            const { insertId } = await copyComponentActionRow(component_id);
            interaction.reply({ content: '복사되었습니다. - ' + insertId, ephemeral: true });
            break;
        }
        case 'edit': // 수정버튼
            // 수정버튼
            const model = await getComponentActionRowEditByModel(component_id);

            // 모달처리
            interaction.model({
                ...model,
                custom_id: `component_action_row edit ${component_id}`,
            });
            break;
        //
    }
};
