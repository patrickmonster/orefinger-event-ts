import {
    APIApplicationCommandInteractionDataBasicOption,
    APIApplicationCommandSubcommandOption,
    ApplicationCommandOptionType,
    APIApplicationCommandSubcommandGroupOption
} from 'discord-api-types/v10';
import { basename } from 'path';

import { getAuthUsers } from 'controllers/auth';
import { AppChatInputInteraction } from 'interactions/app';

// import api from "utils/discordApiInstance"

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');
const type = ApplicationCommandOptionType.Subcommand;

export const exec = async (interaction: AppChatInputInteraction, selectOption: APIApplicationCommandInteractionDataBasicOption[]) => {
    const user = selectOption.find(({ name }) => ['사용자', '사용자ID'.includes(name)])?.value;

    if (!user) {
        return await interaction.re({ content: '필수값 : 사용자', ephemeral: true });
    }
    const { list } = await getAuthUsers({
        page: 0,
        user_id: user?.toString(),
    });

    interaction.re({
        content: `<@${user}>님의 권한 목록
${list.map(({ user_id, login, name, create_at }) => `${name}(${login}) - ${user_id} - ${create_at}`).join('\n')}
        `,
    });
};

const api: APIApplicationCommandSubcommandOption = {
    name,
    type,
    description: '봇 관리자(운영자) 데시보드',
    options: [
        {
            name: '사용자ID',
            type: ApplicationCommandOptionType.Integer,
            description: 'ID조회',
            required: false,
        },
        {
            name: '사용자',
            type: ApplicationCommandOptionType.User,
            description: '선택조회',
            required: false,
        },
    ],
};

// 인터렉션 이벤트
export default api;
