import { APIApplicationCommandSubcommandOption, ApplicationCommandOptionType } from 'discord-api-types/v10';
import { basename } from 'path';

import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');
const type = ApplicationCommandOptionType.Subcommand;

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    const { guild_id, channel } = interaction;

    await interaction.differ({ ephemeral: true });
    if (!guild_id) return;
    // TODO: 알림 설정 - 개인 메세지도 추후....

    // 이벤트 배치에 등록
    // await interaction.defer();
};

const api: APIApplicationCommandSubcommandOption = {
    name,
    type,
    description: '소셜 알림을 등록합니다.',
    options: [
        {
            name: '치지직',
            description: '사용자의 치지직 정보를 조회합니다.',
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
        },
    ],
};

// 인터렉션 이벤트
export default api;
