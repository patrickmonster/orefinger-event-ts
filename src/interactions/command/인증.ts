import {
    APIApplicationCommandInteractionDataBasicOption,
    APIApplicationCommandSubcommandOption,
    ApplicationCommandOptionType,
} from 'discord-api-types/v10';
import { basename } from 'path';

import { AppChatInputInteraction } from 'interactions/app';

// import api from "utils/discordApiInstance"

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');
const type = ApplicationCommandOptionType.Subcommand;

export const exec = async (interaction: AppChatInputInteraction, selectOption: APIApplicationCommandInteractionDataBasicOption[]) => {
    const { member, guild_id, channel } = interaction;
    // if (!guild_id) return await interaction.reply({ content: '서버에서만 사용할 수 있습니다.', ephemeral: true });

    const reply = await interaction.differ({ ephemeral: true });
    const type = selectOption.find(({ name }) => name === '타입')?.value;
};

const api: APIApplicationCommandSubcommandOption = {
    name,
    type,
    description: '알리미 인증 설정을 변경합니다.',
    name_localizations: {
        ko: '인증',
        'en-US': 'Authentication',
        ja: '認証',
    },
    description_localizations: {
        ko: '알리미 인증 설정을 변경합니다.',
        'en-US': 'Change the notification authentication settings.',
        ja: '通知認証設定を変更します。',
    },
    // options: [
    //     {
    //         name: '타입',
    //         type: ApplicationCommandOptionType.Integer,
    //         description: '설정하실 옵션을 선택해 주세요',
    //         choices: [
    //             {
    //                 name: '알림',
    //                 value: 0,
    //             },
    //             {
    //                 name: '채팅',
    //                 value: 1,
    //             },
    //             // {
    //             //     name: '임베드',
    //             //     value: 2,
    //             // },
    //         ],
    //         required: true,
    //     },
    // ],
};

// 인터렉션 이벤트
export default api;
