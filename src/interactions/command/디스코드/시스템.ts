import {
    APIApplicationCommandInteractionDataBasicOption,
    APIApplicationCommandSubcommandOption,
    ApplicationCommandOptionType,
    ButtonStyle,
    ComponentType,
} from 'discord-api-types/v10';
import { basename } from 'path';

import { selectComponentMenuByKey } from 'components/systemComponent';
import { AppChatInputInteraction } from 'interactions/app';

const choices = ['메세지', '텍스트', 'auth_type'];

export const exec = async (interaction: AppChatInputInteraction, selectOption: APIApplicationCommandInteractionDataBasicOption[]) => {
    console.log('컴포넌트 수신', selectOption);

    const type = selectOption.find(({ name }) => ['타입'].includes(name))?.value;

    await interaction.differ({ ephemeral: true });
    switch (type) {
        case choices.indexOf('텍스트'):
            interaction.reply({
                content: `${choices[type]}`,
                components: await selectComponentMenuByKey(
                    {
                        custom_id: 'discord system text',
                        placeholder: '텍스트 선택해주세요!',
                        disabled: false,
                        max_values: 1,
                        min_values: 1,
                        button: {
                            custom_id: 'text create',
                            label: '텍스트 생성',
                            type: ComponentType.Button,
                            style: ButtonStyle.Primary,
                        },
                    },
                    `
SELECT CAST(text_id AS CHAR) AS value
    , tag AS label
    , LEFT(message, 100) AS description
FROM text_message
WHERE parent_id IS NULL 
                `
                ),
            });
            break;
        case choices.indexOf('메세지'):
            interaction.reply({
                content: `${choices[type]}`,
                components: await selectComponentMenuByKey(
                    {
                        custom_id: 'discord system text',
                        placeholder: '텍스트 선택해주세요!',
                        disabled: false,
                        max_values: 1,
                        min_values: 1,
                        button: {
                            custom_id: 'text create',
                            label: '텍스트 생성',
                            type: ComponentType.Button,
                            style: ButtonStyle.Primary,
                        },
                    },
                    `
SELECT CAST(text_id AS CHAR) AS value
    , tag AS label
    , LEFT(message, 100) AS description
FROM text_message
WHERE parent_id IS NULL 
                `
                ),
            });
            break;
        case choices.indexOf('auth_type'):
            interaction.reply({
                content: `${choices[type]}`,
                components: await selectComponentMenuByKey(
                    {
                        custom_id: 'discord system auth_type',
                        placeholder: '인증을 선택해주세요!',
                        disabled: false,
                        max_values: 1,
                        min_values: 1,
                    },
                    `
SELECT json_object( 'name', IF( use_yn = 'Y', '🔴','⚫')) AS emoji
    ,  CAST(auth_type AS CHAR) AS value
    , CONCAT(tag, '] ',tag_kr) AS label
FROM auth_type at2 
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
    description: '봇 관리자(운영자) 데시보드 - 시스템운용',
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

export const isAdmin = true; // 봇 관리자만 사용 가능

// 인터렉션 이벤트
export default api;
