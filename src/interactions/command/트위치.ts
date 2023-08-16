import { basename } from 'path';
import { APIApplicationCommandInteractionDataOption, ApplicationCommandOptionType } from 'discord-api-types/v10';

import getOptions, { getSubcommand } from 'components/chatInputOption';
import { AppChatInputInteraction } from 'interactions/app';
import authTokenSelect from 'components/authTokenSelect';

import autoLoader from 'utils/autoCommand';
import { join } from 'path';

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');
const type = ApplicationCommandOptionType.Subcommand;

const getTwitchCommand = autoLoader(join(__dirname, name), {
    pathTag: ' ',
    isLog: true,
    isSubfolder: false,
    defaultFunction: async (interaction: AppChatInputInteraction) => {
        await interaction.re({ content: '해당 명령은 등록 하지 않는 명령 입니다.' });
    },
});

export const exec = async (interaction: AppChatInputInteraction) => {
    const { user } = interaction;

    console.log('interaction.options', interaction.options);
    interaction.re({
        content: '테스트',
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
