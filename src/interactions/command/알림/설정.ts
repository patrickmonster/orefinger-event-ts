import {
    APIApplicationCommandSubcommandOption,
    APIButtonComponent,
    ApplicationCommandOptionType,
} from 'discord-api-types/v10';
import { basename } from 'path';

import { selectComponentPagingMenuByKey } from 'components/systemComponent';
import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';

const createConponentSelectMenuByComponentPagingMenuByKey = async (
    options: {
        custom_id: string;
        placeholder: string;
        button?: APIButtonComponent;
    },
    query: string,
    ...params: any[]
) => {
    return await selectComponentPagingMenuByKey(
        {
            custom_id: options.custom_id,
            placeholder: options.placeholder,
            button: options.button,
            disabled: false,
            max_values: 1,
            min_values: 1,
        },
        query,
        ...params
    );
};

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');
const type = ApplicationCommandOptionType.Subcommand;

const choices = ['인증', '방송'];

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    const { guild_id, channel } = interaction;

    await interaction.differ({ ephemeral: true });
    if (!guild_id) return;
    const type = selectOption.get('타입');

    switch (type) {
        case choices.indexOf('인증'):
            break;
        case choices.indexOf('방송'):
            break;
        case choices.indexOf('유튜브'):
            break;
    }
};

const api: APIApplicationCommandSubcommandOption = {
    name,
    type,
    description: '소셜 알림을 설정합니다.',
    options: [
        {
            name: '타입',
            type: ApplicationCommandOptionType.Number,
            description: '설정 옵션',
            required: true,
            choices: choices.map((choice, index) => ({ name: choice, value: index })),
        },
    ],
};

// 인터렉션 이벤트
export default api;
