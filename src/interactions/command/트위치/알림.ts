import {
    APIApplicationCommandSubcommandOption,
    ApplicationCommandOptionType,
    RESTGetAPIGuildChannelsResult,
    SelectMenuDefaultValueType,
} from 'discord-api-types/v10';
import { basename } from 'path';

import { onlineChannels } from 'controllers/channel';
import { AppChatInputInteraction } from 'interactions/app';
import discord from 'utils/discordApiInstance';

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');
const type = ApplicationCommandOptionType.Subcommand;

export const exec = async (interaction: AppChatInputInteraction) => {
    const { member, guild_id } = interaction;

    if (!guild_id) return await interaction.re({ content: '서버에서만 사용할 수 있습니다.', ephemeral: true });

    const reply = await interaction.deffer({ ephemeral: true });

    // 활성 채널 목록
    const channels = await discord
        .get<RESTGetAPIGuildChannelsResult>(`/guilds/${guild_id}/channels`)
        .then(async channels => await onlineChannels({ channels_id: channels.map(({ id }) => id) }));

    await reply({
        content: '채널 목록',
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 8,
                        custom_id: 'online_channel',
                        max_values: 1,
                        min_values: 1,
                        default_values: channels.map(({ channel_id }) => ({
                            id: channel_id,
                            type: SelectMenuDefaultValueType.Channel,
                        })),
                    },
                ],
            },
        ],
    });
};

const api: APIApplicationCommandSubcommandOption = {
    name,
    type,
    description: '트위치 알림을 등록합니다.',
    options: [
        // {
        //     name: '채널',
        //     type: ApplicationCommandOptionType.Channel,
        //     channel_types: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
        //     description: '알림을 받을 채널을 선택해 주세요!',
        //     required: true,
        // },
        {
            name: '사용자',
            type: ApplicationCommandOptionType.User,
            description: '알림을 등록할 사용자를 선택해 주세요.',
            required: false,
        },
    ],
};

// 인터렉션 이벤트
export default api;
