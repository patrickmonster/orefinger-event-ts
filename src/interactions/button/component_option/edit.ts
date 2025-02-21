import { MessageInteraction } from 'fastify-discord';

import { selectComponentPagingMenuByKey } from 'components/systemComponent';
import { ParseInt } from 'utils/object';

/**
 *
 * 온라인 알림 이벤트 등록
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, command_id: string, target: string) => {
    await interaction.differ({ ephemeral: true });
    switch (target) {
        case 'option':
            // 컴포넌트 하위 옵션 수정
            interaction.reply({
                ephemeral: true,
                content: `${command_id} - ${target}`,
                components: await selectComponentPagingMenuByKey(
                    {
                        custom_id: `component_option edit ${command_id} option`,
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
        case 'label':
            interaction.reply({
                ephemeral: true,
                content: `${command_id}] 라벨변경`,
                components: await selectComponentPagingMenuByKey(
                    {
                        custom_id: `component_option edit ${command_id} text`,
                        placeholder: '적용하실 라벨을 선택해 주세요.',
                        disabled: false,
                        max_values: 1,
                        min_values: 0,
                    },
                    `
SELECT CAST(a.text_id AS CHAR) AS value
    , a.tag AS label
    , LEFT(a.message, 100) AS description
    , IF(a.text_id = ( SELECT label_id FROM component_option c WHERE 1=1 AND c.option_id = ? ), true, false) AS \`default\`
FROM text_message a
WHERE parent_id IS NULL 
                `,
                    ParseInt(command_id)
                ),
            });
            break;
        //
    }
};
