import { basename } from 'path';
import { join } from 'path';

import { APIApplicationCommandInteractionDataOption, ApplicationCommandOptionType } from 'discord-api-types/v10';

import { AppChatInputInteraction } from 'interactions/app';
import autoLoader from 'utils/autoCommand';

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');
const type = ApplicationCommandOptionType.Subcommand;

const getTwitchCommand = autoLoader(join(__dirname, name), {
    pathTag: ' ',
    isLog: true,
    isSubfolder: false,
    isOption: true,
    defaultFunction: false,
});

export const exec = async (interaction: AppChatInputInteraction) => {
    if (!interaction.options)
        return interaction.re({
            content: '잘못된 명령어 입니다.',
        });

    for (const option of interaction.options) {
        const { name } = option;
        const command = getTwitchCommand(name);
        if (command) return command<AppChatInputInteraction, APIApplicationCommandInteractionDataOption>(interaction, interaction.options);
    }

    interaction.re({
        content: '존재하지 않는 명령 입니다.',
    });
};

// APIApplicationCommandInteractionDataOption
const api: APIApplicationCommandInteractionDataOption = {
    name,
    type,
    options: [],
    // options: [],
};

// 인터렉션 이벤트
export default api;
