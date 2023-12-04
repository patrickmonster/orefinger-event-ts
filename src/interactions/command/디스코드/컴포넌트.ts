import {
    APIApplicationCommandSubcommandOption,
    APIButtonComponent,
    ApplicationCommandOptionType,
} from 'discord-api-types/v10';
import { basename } from 'path';

import { selectComponentPagingMenuByKey } from 'components/systemComponent';
import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';

import QUERY from 'controllers/component/embedListQuerys';
import { createPrimaryButton } from 'utils/discord/component';

const choices = [
    'component_type',
    'component_style',
    'component',
    'component_option',
    'component_action_row',
    'embed',
    'embed_user',
];

const createConponentSelectMenuByComponentPagingMenuByKey = async (
    options: {
        custom_id: string;
        placeholder: string;
        button: APIButtonComponent;
    },
    query: string,
    ...params: any[]
) => {
    return await selectComponentPagingMenuByKey(
        {
            custom_id: options.custom_id,
            placeholder: options.placeholder,
            button: options.button,
            disabled: false,
            max_values: 1,
            min_values: 1,
        },
        query,
        ...params
    );
};

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    console.log('컴포넌트 수신', selectOption);

    const type = selectOption.get('타입');

    await interaction.differ({ ephemeral: true });
    switch (type) {
        case choices.indexOf('component'):
            interaction.reply({
                content: `${choices[type]}`,
                components: await createConponentSelectMenuByComponentPagingMenuByKey(
                    {
                        custom_id: 'component list',
                        placeholder: '컴포넌트를 선택해주세요!',
                        button: createPrimaryButton('component create', {
                            label: '새로만들기',
                        }),
                    },
                    QUERY.ComponentByMenuListQuery
                ),
            });
            break;
        case choices.indexOf('component_action_row'):
            interaction.reply({
                content: `${choices[type]}`,
                components: await createConponentSelectMenuByComponentPagingMenuByKey(
                    {
                        custom_id: 'component_action_row list',
                        placeholder: '로우 컴포넌트를 선택해주세요!',
                        button: createPrimaryButton('component_action_row create', {
                            label: '새로만들기',
                        }),
                    },
                    QUERY.ComponentActionLowByMenuListQuery
                ),
            });
            break;
        case choices.indexOf('component_option'):
            interaction.reply({
                content: `${choices[type]}`,
                components: await createConponentSelectMenuByComponentPagingMenuByKey(
                    {
                        custom_id: 'component_option list',
                        placeholder: '컴포넌트 옵션을 선택해주세요!',
                        button: createPrimaryButton('component_option create', {
                            label: '새로만들기',
                        }),
                    },
                    QUERY.ComponentOptionByMenuListQuery
                ),
            });
            break;
        case choices.indexOf('component_type'):
            interaction.reply({
                content: `${choices[type]}`,
                components: await createConponentSelectMenuByComponentPagingMenuByKey(
                    {
                        custom_id: 'component_type list',
                        placeholder: '컴포넌트 타입을 선택해주세요!',
                        button: createPrimaryButton('component_type create', {
                            label: '새로만들기',
                        }),
                    },
                    QUERY.ComponentTypeByMenuListQuery
                ),
            });
            break;
        case choices.indexOf('component_style'):
            interaction.reply({
                content: `${choices[type]}`,
                components: await createConponentSelectMenuByComponentPagingMenuByKey(
                    {
                        custom_id: 'component_style list',
                        placeholder: '컴포넌트 스타일을 선택해주세요!',
                        button: createPrimaryButton('component_style create', {
                            label: '새로만들기',
                        }),
                    },
                    QUERY.ComponentStyleByMenuListQuery
                ),
            });
            break;
        case choices.indexOf('embed'):
            interaction.reply({
                content: `${choices[type]}`,
                components: await createConponentSelectMenuByComponentPagingMenuByKey(
                    {
                        custom_id: 'embed list',
                        placeholder: '임베드를 선택해주세요!',
                        button: createPrimaryButton('embed create', {
                            label: '새로만들기',
                        }),
                    },
                    QUERY.EmbedByMenuListQuery
                ),
            });
            break;
        case choices.indexOf('embed_user'):
            interaction.reply({
                content: `${choices[type]}`,
                components: await createConponentSelectMenuByComponentPagingMenuByKey(
                    {
                        custom_id: 'embed_user list',
                        placeholder: '사용자용 임베드를 선택해주세요!',
                        button: createPrimaryButton('embed_user create', {
                            label: '새로만들기',
                        }),
                    },
                    QUERY.EmbedUserByMenuListQuery
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

export const isAdmin = true; // 봇 관리자만 사용 가능
export default api;
