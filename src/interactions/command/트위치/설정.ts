import {
    APIApplicationCommandInteractionDataBasicOption,
    APIApplicationCommandSubcommandOption,
    ApplicationCommandOptionType,
} from 'discord-api-types/v10';
import { basename } from 'path';

import { channels } from 'components/guild';
import { AppChatInputInteraction } from 'interactions/app';

// import api from "utils/discordApiInstance"

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');
const type = ApplicationCommandOptionType.Subcommand;

export const exec = async (interaction: AppChatInputInteraction, selectOption: APIApplicationCommandInteractionDataBasicOption[]) => {
    const { member, guild_id, channel } = interaction;
    if (!guild_id) return await interaction.re({ content: '서버에서만 사용할 수 있습니다.', ephemeral: true });

    const reply = await interaction.deffer({ ephemeral: true });
    const type = selectOption.find(({ name }) => name === '타입')?.value;

    console.log('타입', type);

    // [ { name: '타입', type: 4, value: 3 } ]
    switch (type) {
        case 0: {
            // 알림 (in discord)
            const events = await channels(guild_id);
            console.log('events', events);

            break;
        }
        case 1: {
            // 채팅 (in twitch)
            break;
        }
        case 2: {
            // 임베드 (in viewer)
            break;
        }
        default: {
            await reply({ content: '옵션은 필수 값 입니다', ephemeral: true });
        }
    }
};

const api: APIApplicationCommandSubcommandOption = {
    name,
    type,
    description: '트위치 관련 설정을 변경합니다.',
    options: [
        {
            name: '타입',
            type: ApplicationCommandOptionType.Integer,
            description: '설정하실 옵션을 선택해 주세요',
            choices: [
                {
                    name: '알림',
                    value: 0,
                },
                {
                    name: '채팅',
                    value: 1,
                },
                // {
                //     name: '임베드',
                //     value: 2,
                // },
            ],
            required: true,
        },
    ],
};

// 인터렉션 이벤트
export default api;
