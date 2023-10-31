import { MessageInteraction } from 'interactions/message';

import { selectComponentMenuByKey } from 'components/systemComponent';
import { ParseInt, copyComponentActionRow, getComponentActionRowEditByModel } from 'controllers/component';

/**
 *
 * 온라인 알림 이벤트 등록
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, component_id: string, target: string) => {
    switch (target) {
        case 'option':
            interaction.reply({
                components: await selectComponentMenuByKey(
                    {
                        custom_id: 'discord component component',
                        placeholder: '컴포넌트를 선택해주세요!',
                        disabled: false,
                        max_values: 5,
                        min_values: 0,
                    },
                    `
SELECT JSON_OBJECT( IF(REGEXP_LIKE(c.emoji, '^[0-9]+$'), 'id', 'name'), IF( c.emoji < '' OR c.emoji IS NULL, '▫', c.emoji)) AS emoji
    , CAST(component_id AS CHAR) AS value
    , CONCAT( component_id , ']' , name) AS label 
    , concat(ct.tag, "] ", name) AS  description
    , EXISTS(
        SELECT 1
        FROM component_action_row_connect carc WHERE carc.component_id = ? AND use_yn = 'Y'
    ) AS \`default\`
FROM component c
LEFT JOIN component_type ct ON c.type_idx = ct.type_idx
                `,
                    ParseInt(component_id)
                ),
            });
            break;
        case 'order': // 정렬상태 수정
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
