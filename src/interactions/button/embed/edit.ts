import { MessageInteraction } from 'interactions/message';

import { selectComponentPagingMenuByKey } from 'components/systemComponent';
import { copyComponent, selectComponentBaseEditByModel } from 'controllers/component';
import { getEmbedDtilByEmbed } from 'controllers/embed';

/**
 *
 * 온라인 알림 이벤트 등록
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, embed_id: string, target: string) => {
    switch (target) {
        case 'reload': {
            const { content, embed } = await getEmbedDtilByEmbed(embed_id);
            interaction.edit({
                content,
                embeds: [embed],
            });
            break;
        }
        case 'option':
            interaction.reply({
                ephemeral: true,
                content: `${embed_id} - ${target}`,
                components: await selectComponentPagingMenuByKey(
                    {
                        custom_id: `component edit ${embed_id} option`,
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
LEFT JOIN component_option_connection coc ON coc.option_id = co.option_id AND coc.embed_id = ?
WHERE 1=1
                    `,
                    embed_id
                ),
            });
            break;
        case 'edit': {
            const model = await selectComponentBaseEditByModel(embed_id);

            // 모달처리
            interaction.model({
                ...model,
                custom_id: `component edit ${embed_id}`,
            });
            break;
        }
        case 'text': {
            interaction.reply({
                ephemeral: true,
                content: `${embed_id}] 라벨변경`,
                components: await selectComponentPagingMenuByKey(
                    {
                        custom_id: `component edit ${embed_id} text`,
                        placeholder: '적용하실 라벨을 선택해 주세요.',
                        disabled: false,
                        max_values: 1,
                        min_values: 0,
                    },
                    `
SELECT CAST(a.text_id AS CHAR) AS value
, a.tag AS label
, LEFT(a.message, 100) AS description
, IF(a.text_id = ( SELECT label_id FROM component c WHERE 1=1 AND c.embed_id = ? ), true, false) AS \`default\`
FROM text_message a
WHERE parent_id IS NULL 
                    `,
                    embed_id
                ),
            });
            break;
        }
        case 'copy': {
            // 복사버튼
            const { insertId } = await copyComponent(embed_id);
            interaction.reply({ content: '복사되었습니다. - ' + insertId, ephemeral: true });
            break;
        }
        case 'delete': {
            // 삭제버튼
            // const { insertId } = await copyComponent(embed_id);
            // interaction.reply({ content: '복사되었습니다. - ' + insertId, ephemeral: true });
            break;
        }
    }
};
