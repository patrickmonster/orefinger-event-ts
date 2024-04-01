import { APIApplicationCommandSubcommandOption, ApplicationCommandOptionType } from 'discord-api-types/v10';
import { basename } from 'path';

import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';

// import api from "utils/discordApiInstance"

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');
const type = ApplicationCommandOptionType.Subcommand;

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    await interaction.reply({
        embeds: [
            {
                title: '고양이를 불러왔어요!',
                image: { url: 'https://cataas.com/cat' },
                footer: {
                    text: 'From cataas API',
                },
            },
        ],
    });
};

const api: APIApplicationCommandSubcommandOption = {
    name,
    type,
    description: '고양이를 불러옵니다',
};

// 인터렉션 이벤트
export default api;
