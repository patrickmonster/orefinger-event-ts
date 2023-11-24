import {
    APIApplicationCommandInteractionDataBasicOption,
    APIApplicationCommandSubcommandOption,
    ApplicationCommandOptionType,
} from 'discord-api-types/v10';
import { basename } from 'path';

import { upsertDiscordUserAndJWTToken } from 'controllers/auth';
import { AppChatInputInteraction } from 'interactions/app';

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');
const type = ApplicationCommandOptionType.Subcommand;

export const exec = async (
    interaction: AppChatInputInteraction,
    selectOption: APIApplicationCommandInteractionDataBasicOption[]
) => {
    const { member, user, guild_id, channel } = interaction;

    const reply = await interaction.differ({ ephemeral: true });
    const type = selectOption.find(({ name }) => name === '타입')?.value;

    const apiUser = member?.user || user;

    if (apiUser) await upsertDiscordUserAndJWTToken(apiUser);
};

const api: APIApplicationCommandSubcommandOption = {
    name,
    type,
    description: '알리미 인증 설정을 변경합니다.',
};

// 인터렉션 이벤트
export default api;
