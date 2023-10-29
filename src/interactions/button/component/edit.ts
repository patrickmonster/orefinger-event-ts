import { MessageInteraction } from 'interactions/message';

import {} from 'components/onlineTwitchChannel';
import { selectComponentMenuByKey } from 'components/systemComponent';

/**
 *
 * 온라인 알림 이벤트 등록
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, command_id: string, target: string) => {
    const { user, guild_id } = interaction;

    console.log('??????????', command_id, target);

    switch (target) {
        case 'option':
            interaction.reply({
                ephemeral: true,
                content: `${command_id} - ${target}`,
                components: await selectComponentMenuByKey(
                    {
                        custom_id: 'discord component component_option_connect',
                        placeholder: '컴포넌트를 선택해주세요!',
                        disabled: false,
                        max_values: 1,
                        min_values: 1,
                    },
                    `
SELECT json_object( IF(regexp_like(co.emoji, '^[0-9]+$'), 'id', 'name'), IF( co.emoji < '' OR co.emoji IS NULL, '▫', co.emoji)) AS emoji
    , CAST(co.option_id AS CHAR) AS value
    , IF(co.label_id IS NULL, label, f_get_text(co.label_id)) AS label
    , LEFT(IF(co.description_id IS NULL, co.description, f_get_text(co.description_id)), 100) AS description
    , IF(coc.use_yn = 'Y', true, false) AS \`default\`
FROM component_option co
LEFT JOIN component_option_connection coc ON coc.option_id = co.option_id AND coc.component_id = ?
WHERE 1=1
                    `,
                    command_id
                ),
            });
            break;
    }
};

//  해당 명령은 등록 하지 않는 명령 입니다.
export default {
    // alias: ['출석'],
};
