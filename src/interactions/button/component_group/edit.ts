import { MessageInteraction } from 'interactions/message';

import { selectComponentPagingMenuByKey } from 'components/systemComponent';
import { ParseInt, copyComponentGroup, getComponentGroupEditByModel } from 'controllers/component';

/**
 *
 * 온라인 알림 이벤트 등록
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, command_id: string, target: string) => {
    switch (target) {
        case 'option':
            interaction.reply({
                ephemeral: true,
                content: `${command_id} - ${target}`,
                components: await selectComponentPagingMenuByKey(
                    {
                        custom_id: `component_group edit ${command_id} option`,
                        placeholder: '컴포넌트를 선택해주세요!',
                        disabled: false,
                        max_values: 15,
                        min_values: 0,
                    },
                    `
SELECT json_object( IF(regexp_like(co.emoji, '^[0-9]+$'), 'id', 'name'), IF( co.emoji < '' OR co.emoji IS NULL, '▫', co.emoji)) AS emoji
    , CAST(co.option_id AS CHAR) AS value
    , IF(co.label_id IS NULL, label, f_get_text(co.label_id)) AS label
    , LEFT(IF(co.description_id IS NULL, co.description, f_get_text(co.description_id)), 100) AS description
    , IF(coc.use_yn = 'Y', TRUE, FALSE) AS \`default\`
FROM component_option co
LEFT JOIN component_option_connection coc ON coc.option_id = co.option_id AND coc.component_id = ?
WHERE 1=1
                    `,
                    ParseInt(command_id)
                ),
            });
            break;
        case 'edit': {
            // 수정버튼
            const model = await getComponentGroupEditByModel(command_id);

            // 모달처리
            interaction.model({
                ...model,
                custom_id: `component_group edit ${command_id}`,
            });
            break;
        }
        case 'copy': {
            // 복사버튼
            const result = await copyComponentGroup(command_id);
            interaction.reply({ content: '복사되었습니다. - ' + result.insertId, ephemeral: true });
            break;
        }
        case 'delete': {
            // 삭제버튼
            break;
        }
        //
    }
};
