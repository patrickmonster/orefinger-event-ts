import {
    APIApplicationCommandInteractionDataBasicOption,
    APIApplicationCommandSubcommandOption,
    ApplicationCommandOptionType,
} from 'discord-api-types/v10';
import { basename } from 'path';

import menu from 'components/menu';
import { getComponentList } from 'controllers/component';
import { AppChatInputInteraction } from 'interactions/app';

// import api from "utils/discordApiInstance"
const choices = ['component', 'component_group', 'component_option', 'component_option_connection', 'component_low', 'component_col'];

export const exec = async (interaction: AppChatInputInteraction, selectOption: APIApplicationCommandInteractionDataBasicOption[]) => {
    console.log('컴포넌트 수신', selectOption);

    const type = selectOption.find(({ name }) => ['타입'].includes(name))?.value;

    const reply = await interaction.differ({ ephemeral: true });
    switch (type) {
        case choices.indexOf('component'):
            getComponentList({ page: 0, limit: 15 }).then(res => {
                interaction.reply({
                    components: menu(
                        {
                            custom_id: 'discord component 0',
                            placeholder: '컴포넌트를 선택해주세요!',
                            disabled: false,
                            max_values: 1,
                            min_values: 1,
                        },
                        ...res.list.map(
                            ({
                                component_id,
                                name,
                                label_id,
                                label_lang,
                                type_idx,
                                type,
                                label,
                                text_id,
                                emoji,
                                custom_id,
                                value,
                                style,
                                style_name,
                                min_values,
                                max_values,
                                disabled,
                                required,
                                use_yn,
                                edit,
                                permission_type,
                                create_at,
                                update_at,
                                order_by,
                            }) => ({
                                label: `${name}`,
                                value: `${component_id}`,
                                description: `${type}] ${label}`,
                                emoji: { name: emoji || '▫' },
                            })
                        )
                    ),
                });
            });

            break;
        case choices.indexOf('component_group'):
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
