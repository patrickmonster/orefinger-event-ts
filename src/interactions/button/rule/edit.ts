import { MessageInteraction } from 'interactions/message';

import { selectComponentPagingMenuByKey } from 'components/systemComponent';
import { copyComponent, selectComponentBaseEditByModel } from 'controllers/component';
import { selectEmbedBaseEditByModel, selectEmbedDtilByEmbed, selectEmbedUserBaseEditByModel } from 'controllers/embed';

import QUERY from 'controllers/component/embedListQuerys';
/**
 *
 * 온라인 알림 이벤트 등록
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, embed_id: string, target: string) => {
    switch (target) {
        case 'reload': {
            const { content, embed } = await selectEmbedDtilByEmbed(embed_id);
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
                    QUERY.ComponentOptionConnectionByMenuListQuery,
                    embed_id
                ),
            });
            break;
        case 'edit': {
            const model = await selectEmbedUserBaseEditByModel(embed_id);

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
                    QUERY.TextMessageDefaultByMenuListQuery(
                        `SELECT label_id FROM component c WHERE 1=1 AND c.embed_id = ?`,
                        embed_id
                    )
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
