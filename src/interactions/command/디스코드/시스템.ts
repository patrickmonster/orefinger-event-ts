import { APIApplicationCommandSubcommandOption, ApplicationCommandOptionType } from 'discord-api-types/v10';
import { basename } from 'path';

import { selectComponentPagingMenuByKey } from 'components/systemComponent';
import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';

import QUERY from 'controllers/component/embedListQuerys';
import { createPrimaryButton } from 'utils/discord/component';

const choices = ['텍스트', 'auth_type'];

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    console.log('컴포넌트 수신', selectOption);

    const type = selectOption.get('타입');

    await interaction.differ({ ephemeral: true });
    switch (type) {
        case choices.indexOf('텍스트'):
            interaction.reply({
                content: `${choices[type]}`,
                components: await selectComponentPagingMenuByKey(
                    {
                        custom_id: 'discord system text',
                        placeholder: '텍스트 선택해주세요!',
                        disabled: false,
                        max_values: 1,
                        min_values: 1,
                        button: createPrimaryButton('text create', {
                            label: '텍스트 생성',
                        }),
                    },
                    QUERY.TextMessageByMenuListQuery
                ),
            });
            break;
        case choices.indexOf('auth_type'):
            interaction.reply({
                content: `${choices[type]}`,
                components: await selectComponentPagingMenuByKey(
                    {
                        custom_id: 'discord system auth_type',
                        placeholder: '인증을 선택해주세요!',
                        disabled: false,
                        max_values: 1,
                        min_values: 1,
                    },
                    QUERY.AuthTypeByMenuListQuery
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
export default api;
