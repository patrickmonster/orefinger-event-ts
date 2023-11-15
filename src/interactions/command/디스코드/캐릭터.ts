import {
    APIApplicationCommandSubcommandOption,
    APIButtonComponent,
    ApplicationCommandOptionType,
    ChannelType,
} from 'discord-api-types/v10';
import { basename } from 'path';

import { selectComponentPagingMenuByKey } from 'components/systemComponent';
import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';

const choices = ['게시글복구'];

const createConponentSelectMenuByComponentPagingMenuByKey = async (
    options: {
        custom_id: string;
        placeholder: string;
        button: APIButtonComponent;
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

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    const { channel } = interaction;

    console.log('컴포넌트 수신', selectOption);

    const type = selectOption.get('타입');
    const selectChannel = selectOption.get('채널', channel?.id);
};

const api: APIApplicationCommandSubcommandOption = {
    name: basename(__filename, __filename.endsWith('js') ? '.js' : '.ts'),
    type: ApplicationCommandOptionType.Subcommand,
    description: '캐릭터를 관리합니다.',
    options: [
        {
            name: '타입',
            type: ApplicationCommandOptionType.Number,
            description: '설정 옵션',
            choices: choices.map((v, i) => ({ name: v, value: i })),
            required: true,
        },
        {
            name: '채널',
            type: ApplicationCommandOptionType.Channel,
            description: '설정하실 채널',
            channel_types: [ChannelType.GuildForum],
            // required: true,
        },
    ],
};

export default api;
