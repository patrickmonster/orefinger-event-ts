import {
    APIApplicationCommandInteractionDataBasicOption,
    APIApplicationCommandSubcommandOption,
    ApplicationCommandOptionType,
} from 'discord-api-types/v10';
import { basename } from 'path';

import { getAuthUsers } from 'controllers/auth';
import { AppChatInputInteraction } from 'interactions/app';

// import api from "utils/discordApiInstance"

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');
const type = ApplicationCommandOptionType.Subcommand;

export const exec = async (interaction: AppChatInputInteraction, selectOption: APIApplicationCommandInteractionDataBasicOption[]) => {
    const user = selectOption.find(({ name }) => ['사용자'].includes(name))?.value;

    if (!user) {
        return await interaction.reply({ content: '필수값 : 사용자', ephemeral: true });
    }
    const list = await getAuthUsers({ user_id: user?.toString() });

    interaction.reply({
        content: `<@${user}>님의 권한 목록
${list.map(({ type, user_type, user_id, login, name, create_at }) => `${type}]${name}(${login}) - ${user_id} - ${create_at}`).join('\n')}
        `,
    });
};

const api: APIApplicationCommandSubcommandOption = {
    name,
    type,
    description: '봇 관리자(운영자) 데시보드',
    options: [
        {
            name: '사용자',
            type: ApplicationCommandOptionType.String,
            description: 'ID조회',
            min_length: 17,
            max_length: 20,
            required: true,
        },
    ],
};

// 인터렉션 이벤트
export default api;
