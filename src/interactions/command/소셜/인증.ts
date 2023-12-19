import { APIApplicationCommandSubcommandOption, ApplicationCommandOptionType } from 'discord-api-types/v10';
import { basename } from 'path';

import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');
const type = ApplicationCommandOptionType.Subcommand;

const choices = ['치지직', '네이버', '카카오'];

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    await interaction.differ();
    const type = selectOption.get('타입');

    switch (type) {
        case choices.indexOf('치지직'):
            break;
        case choices.indexOf('네이버'):
            break;
        case choices.indexOf('카카오'):
            break;
    }
};

const api: APIApplicationCommandSubcommandOption = {
    name,
    type,
    description: '소셜 인증을 설정합니다.',
    options: [
        {
            name: '타입',
            type: ApplicationCommandOptionType.Number,
            description: '인증 설정 타입',
            required: true,
            choices: choices.map((choice, index) => ({ name: choice, value: index })),
        },
    ],
};

// 인터렉션 이벤트
export default api;
