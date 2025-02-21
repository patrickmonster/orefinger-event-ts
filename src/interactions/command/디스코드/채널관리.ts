import { getChannel } from 'components/discord';
import {
    APIGuildCategoryChannel,
    APIGuildForumChannel,
    APIGuildMediaChannel,
    APIGuildStageVoiceChannel,
    APIGuildVoiceChannel,
    APINewsChannel,
    APITextChannel,
    APIThreadChannel,
    APIThreadMember,
    ApplicationCommandOptionType,
    ChannelType,
} from 'discord-api-types/v10';

import { AppChatInputInteraction } from 'fastify-discord';
import { SelectOptionType } from 'interactions/app';
import { createChatinputSubCommand } from 'utils/discord/component';

type Channle =
    | APIGuildCategoryChannel
    | APIGuildForumChannel
    | APIGuildMediaChannel
    | APIGuildStageVoiceChannel
    | APIGuildVoiceChannel
    | APINewsChannel
    | APITextChannel
    | APIThreadChannel;

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
    const {
        channel: { id },
    } = interaction;

    const targetChannel = selectOption.get('채널') || id;
    await interaction.differ({ ephemeral: true });

    // 채널 정보를 불러옴
    const channel = await getChannel(`${targetChannel}`);

    if ([ChannelType.DM, ChannelType.GroupDM].includes(channel.type)) {
        return await interaction.reply({
            content: 'DM 채널에서는 사용할 수 없는 기능입니다.',
        });
    }

    const { flags, guild_id, permission_overwrites, nsfw, parent_id, type, position, name } = channel as Channle;

    console.log(flags, guild_id, permission_overwrites, nsfw, parent_id, type, position, name);
    console.log(channel);
};

const api = createChatinputSubCommand(
    {
        description: '현재 채널의 권한을 관리 합니다.',
        options: [
            {
                name: '채널',
                description: '변경할 채널 (미선택시, 현재채널)',
                type: ApplicationCommandOptionType.Channel,
                required: false,
            },
        ],
    },
    __filename
);
export const isAdmin = true; // 봇 관리자만 사용 가능
export default api;
