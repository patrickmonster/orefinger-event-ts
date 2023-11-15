import { APIApplicationCommandSubcommandOption, ApplicationCommandOptionType } from 'discord-api-types/v10';
import { basename } from 'path';

import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';

// import api from "utils/discordApiInstance"

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');
const type = ApplicationCommandOptionType.Subcommand;

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    const { member, guild_id, channel } = interaction;
    // if (!guild_id) return await interaction.reply({ content: '서버에서만 사용할 수 있습니다.', ephemeral: true });

    const reply = await interaction.differ({ ephemeral: true });
    const type = selectOption.get('타입');
};

const api: APIApplicationCommandSubcommandOption = {
    name,
    type,
    description: '알리미 인증 설정을 변경합니다.',
};

// 인터렉션 이벤트
export default api;
