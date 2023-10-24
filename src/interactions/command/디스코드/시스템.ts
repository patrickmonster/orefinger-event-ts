import {
    APIApplicationCommandInteractionDataBasicOption,
    APIApplicationCommandSubcommandOption,
    ApplicationCommandOptionType,
} from 'discord-api-types/v10';
import { basename } from 'path';

import { textSelect } from 'components/System/text';
import { AppChatInputInteraction } from 'interactions/app';

const choices = ['텍스트'];

export const exec = async (interaction: AppChatInputInteraction, selectOption: APIApplicationCommandInteractionDataBasicOption[]) => {
    console.log('컴포넌트 수신', selectOption);

    const type = selectOption.find(({ name }) => ['타입'].includes(name))?.value;

    console.log('????', interaction);

    await interaction.differ({ ephemeral: true });
    switch (type) {
        case choices.indexOf('텍스트'):
            {
                textSelect(interaction, 'select discord text');
            }
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

// 인터렉션 이벤트
export default api;
