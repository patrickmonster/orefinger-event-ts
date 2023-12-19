import { APIApplicationCommandSubcommandOption, ApplicationCommandOptionType } from 'discord-api-types/v10';
import { basename } from 'path';

import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');
const type = ApplicationCommandOptionType.Subcommand;

const choices = ['텍스트', 'auth_type'];

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    //
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
