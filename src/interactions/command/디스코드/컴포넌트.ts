import {
    APIApplicationCommandInteractionDataBasicOption,
    APIApplicationCommandSubcommandOption,
    ApplicationCommandOptionType,
} from 'discord-api-types/v10';
import { basename } from 'path';

import { selectComponentMenuByKey } from 'components/systemComponent';
import { AppChatInputInteraction } from 'interactions/app';

// import api from "utils/discordApiInstance"
const choices = [
    'component_type',
    'component_style',
    'component',
    'component_group',
    'component_option',
    'component_option_connection',
    'component_low',
    'component_col',
];

export const exec = async (interaction: AppChatInputInteraction, selectOption: APIApplicationCommandInteractionDataBasicOption[]) => {
    console.log('컴포넌트 수신', selectOption);

    const type = selectOption.find(({ name }) => ['타입'].includes(name))?.value;

    await interaction.differ({ ephemeral: true });
    switch (type) {
        case choices.indexOf('component'):
            interaction.reply({
                content: `${choices[type]}`,
                components: await selectComponentMenuByKey(
                    {
                        custom_id: 'discord component component',
                        placeholder: '컴포넌트를 선택해주세요!',
                        disabled: false,
                        max_values: 1,
                        min_values: 1,
                        button_id: 'key',
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
                content: `${choices[type]}`,
                components: await selectComponentMenuByKey(
                    {
                        custom_id: 'discord component component_group',
                        placeholder: '컴포넌트를 선택해주세요!',
                        disabled: false,
                        max_values: 1,
                        min_values: 1,
                        button_id: 'key',
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
            interaction.reply({
                content: `${choices[type]}`,
                components: await selectComponentMenuByKey(
                    {
                        custom_id: 'discord component component_option',
                        placeholder: '컴포넌트를 선택해주세요!',
                        disabled: false,
                        max_values: 1,
                        min_values: 1,
                        button_id: 'key',
                    },
                    `
SELECT 
    json_object( IF(regexp_like(emoji, '^[0-9]+$'), 'id', 'name'), IF(emoji < '' OR emoji IS NULL, '▫', emoji)) AS emoji
    , CAST(option_id  AS CHAR) AS value
    , label AS label
    , LEFT(CONCAT(value, '] ', description), 100)  AS description 
FROM component_option co 
                    `
                ),
            });
            break;
        case choices.indexOf('component_option_connection'):
            interaction.reply({
                content: `${choices[type]}`,
                components: await selectComponentMenuByKey(
                    {
                        custom_id: 'discord component component_option_connect',
                        placeholder: '컴포넌트를 선택해주세요!',
                        disabled: false,
                        max_values: 1,
                        min_values: 1,
                        button_id: 'key',
                    },
                    `
SELECT json_object( 'name', IF( coc.use_yn  = 'Y', '🔴','⚫')) AS emoji 
    , CAST(coc.option_id AS CHAR) AS value
    , CONCAT( c.name , '->', co.label ) AS label 
FROM component_option_connection coc
LEFT JOIN component c on c.type_idx = 3 AND c.component_id = coc.component_id
LEFT JOIN component_option co ON co.option_id = coc.option_id 
                    `
                ),
            });
            break;
        case choices.indexOf('component_low'):
            interaction.reply({
                content: `${choices[type]}`,
                components: await selectComponentMenuByKey(
                    {
                        custom_id: 'discord component component_low',
                        placeholder: '컴포넌트를 선택해주세요!',
                        disabled: false,
                        max_values: 1,
                        min_values: 1,
                        button_id: 'key',
                    },
                    `
SELECT  json_object( 'name', IF( cl.use_yn = 'Y', '🔴','⚫')) AS emoji 
    , CAST(cl.idx AS CHAR) AS value
    , CONCAT( cg.name  , '->', c.name )  AS label
FROM component_low cl 
LEFT JOIN component c ON c.component_id  = cl.component_id 
LEFT JOIN component_group cg  ON cl.group_id = cg.group_id 
                    `
                ),
            });
            break;
        case choices.indexOf('component_col'):
            interaction.reply({
                content: `${choices[type]}`,
                components: await selectComponentMenuByKey(
                    {
                        custom_id: 'discord component component_col',
                        placeholder: '컴포넌트를 선택해주세요!',
                        disabled: false,
                        max_values: 1,
                        min_values: 1,
                        button_id: 'key',
                    },
                    `
SELECT  json_object( 'name', IF( cc.use_yn = 'Y', '🔴','⚫')) AS emoji 
    , CAST(cc.idx AS CHAR) AS value
    , CONCAT( cg2.name  , '->', cg.name )  AS label
FROM component_col cc 
LEFT JOIN component_group cg2 ON cg2.group_id = cc.group_id  
LEFT JOIN component_group cg  ON cc.component_id =  cg.group_id  
                    `
                ),
            });
            break;
        case choices.indexOf('component_type'):
            interaction.reply({
                content: `${choices[type]}`,
                components: await selectComponentMenuByKey(
                    {
                        custom_id: 'discord component component_type',
                        placeholder: '컴포넌트를 선택해주세요!',
                        disabled: false,
                        max_values: 1,
                        min_values: 1,
                        button_id: 'key',
                    },
                    `
SELECT json_object( 'name', IF( use_yn = 'Y', '🔴','⚫')) AS emoji
    , CAST(type_idx AS CHAR) AS value
    , CONCAT( code, '] ', tag) AS label
FROM component_type ct 
                    `
                ),
            });
            break;
        case choices.indexOf('component_style'):
            interaction.reply({
                content: `${choices[type]}`,
                components: await selectComponentMenuByKey(
                    {
                        custom_id: 'discord component component_style',
                        placeholder: '컴포넌트를 선택해주세요!',
                        disabled: false,
                        max_values: 1,
                        min_values: 1,
                        button_id: 'key',
                    },
                    `
SELECT json_object( 'name', IF( use_yn = 'Y', '🔴','⚫')) AS emoji
    , CAST(style_idx  AS CHAR) AS value
    , tag AS label
FROM component_style cs  
                    `
                ),
            });
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
