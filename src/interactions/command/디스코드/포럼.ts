import {
    APIApplicationCommandSubcommandOption,
    APIGuildForumChannel,
    APIThreadChannel,
    APIThreadMember,
    ApplicationCommandOptionType,
    ChannelType,
} from 'discord-api-types/v10';
import { basename } from 'path';

import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';
import discord from 'utils/discordApiInstance';

const choices = ['게시글복구'];

export interface APIThreadList {
    /**
     * The threads that were fetched
     */
    threads: APIThreadChannel[] | APIGuildForumChannel[];
    /**
     * The members for the client user in each of the fetched threads
     */
    members: APIThreadMember[];
}

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    const { channel } = interaction;

    console.log('컴포넌트 수신', selectOption);

    const type = selectOption.get('타입');
    const selectChannel = selectOption.get('채널', channel?.id);

    await interaction.differ({ ephemeral: true });
    switch (type) {
        case choices.indexOf('게시글복구'): {
            const result = await discord.get<APIThreadList>(`/channels/${selectChannel}/threads/archived/public`);
            const { threads, members } = result;

            const list = threads.map(({ id, name }) => `<#${id}> - ${name}`);

            interaction.reply({ content: `항목 조회 : ${threads.length}개\n${list.join('\n')}`, ephemeral: true });

            break;
        }
        default:
            interaction.reply({ content: '선택한 타입이 없습니다.', ephemeral: true });
            break;
    }
};

const api: APIApplicationCommandSubcommandOption = {
    name: basename(__filename, __filename.endsWith('js') ? '.js' : '.ts'),
    type: ApplicationCommandOptionType.Subcommand,
    description: '포럼에 관련된 명령어를 처리 합니다.',
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
            required: true,
        },
    ],
};

export default api;
