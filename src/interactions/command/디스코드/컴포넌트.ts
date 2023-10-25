import {
    APIApplicationCommandInteractionDataBasicOption,
    APIApplicationCommandSubcommandOption,
    ApplicationCommandOptionType,
} from 'discord-api-types/v10';
import { basename } from 'path';

import { selectComponentMenuByKey } from 'components/systemComponent';
import { AppChatInputInteraction } from 'interactions/app';

// import api from "utils/discordApiInstance"
const choices = ['component', 'component_group', 'component_option', 'component_option_connection', 'component_low', 'component_col'];

export const exec = async (interaction: AppChatInputInteraction, selectOption: APIApplicationCommandInteractionDataBasicOption[]) => {
    console.log('컴포넌트 수신', selectOption);

    const type = selectOption.find(({ name }) => ['타입'].includes(name))?.value;

    await interaction.differ({ ephemeral: true });
    switch (type) {
        case choices.indexOf('component'):
            interaction.reply({
                components: await selectComponentMenuByKey(
                    {
                        custom_id: 'discord component component',
                        placeholder: '컴포넌트를 선택해주세요!',
                        disabled: false,
                        max_values: 1,
                        min_values: 1,
                        button_id: 'key component',
                    },
                    `
SELECT  
    json_object( IF(regexp_like(c.emoji, '^[0-9]+$'), 'id', 'name'), IF( c.emoji < '' OR c.emoji IS NULL, '▫', c.emoji)) AS emoji
    , CAST(component_id AS CHAR) AS value
    , name AS label 
    , concat(ct.tag, "] ", name) AS  description
FROM component c
LEFT JOIN component_type ct ON c.type_idx = ct.type_idx
                    `
                ),
            });
            break;
        case choices.indexOf('component_group'):
            interaction.reply({
                components: await selectComponentMenuByKey(
                    {
                        custom_id: 'discord component component_group',
                        placeholder: '컴포넌트를 선택해주세요!',
                        disabled: false,
                        max_values: 1,
                        min_values: 1,
                        button_id: 'key group',
                    },
                    `
SELECT 
    json_object( 'name', IF( group_type = 'G', '📂', '📄')) AS emoji
    , CAST(group_id AS CHAR) AS value
    , name AS label 
FROM component_group cg 
                    `
                ),
            });
            break;
        case choices.indexOf('component_option'):
            break;
        case choices.indexOf('component_option_connection'):
            break;
        case choices.indexOf('component_low'):
            break;
        case choices.indexOf('component_col'):
            break;
        default:
            interaction.reply({ content: '선택한 타입이 없습니다.', ephemeral: true });
            break;
    }
};

const api: APIApplicationCommandSubcommandOption = {
    name: basename(__filename, __filename.endsWith('js') ? '.js' : '.ts'),
    type: ApplicationCommandOptionType.Subcommand,
    description: '봇 관리자(운영자) 데시보드 - 컴포넌트',
    options: [
        {
            name: '타입',
            type: ApplicationCommandOptionType.Number,
            description: '설정할 데이터 그룹',
            choices: choices.map((v, i) => ({ name: v, value: i })),
            required: true,
        },
    ],
};

// 인터렉션 이벤트
export default api;
