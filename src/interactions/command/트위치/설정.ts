import {
    APIApplicationCommandInteractionDataBasicOption,
    APIApplicationCommandSubcommandOption,
    ApplicationCommandOptionType,
} from 'discord-api-types/v10';
import { basename } from 'path';

import { AppChatInputInteraction } from 'interactions/app';

const choices = ['알림', '채팅', '디자인'];

export const exec = async (interaction: AppChatInputInteraction, selectOption: APIApplicationCommandInteractionDataBasicOption[]) => {
    const { member, guild_id, channel } = interaction;
    if (!guild_id) return await interaction.reply({ content: '서버에서만 사용할 수 있습니다.', ephemeral: true });

    const reply = await interaction.differ({ ephemeral: true });
    const type = selectOption.find(({ name }) => name === '타입')?.value;

    console.log('타입', type);

    // [ { name: '타입', type: 4, value: 3 } ]
    switch (type) {
        case choices.indexOf('알림'): {
            break;
        }
        case choices.indexOf('채팅'): {
            break;
        }
        case choices.indexOf('디자인'): {
            // 임베드 디자인 수정

            break;
        }
        default: {
            await interaction.reply({ content: '옵션은 필수 값 입니다', ephemeral: true });
        }
    }
};

const api: APIApplicationCommandSubcommandOption = {
    name: basename(__filename, __filename.endsWith('js') ? '.js' : '.ts'),
    type: ApplicationCommandOptionType.Subcommand,
    description: '트위치 관련 설정을 변경합니다.',
    options: [
        {
            name: '타입',
            type: ApplicationCommandOptionType.Number,
            description: '설정하실 옵션을 선택해 주세요',
            choices: choices.map((v, i) => ({ name: v, value: i })),
            required: true,
        },
    ],
};

// 인터렉션 이벤트
export default api;
