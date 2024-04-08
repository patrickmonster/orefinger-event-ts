import { ChannelType } from 'discord-api-types/v10';
import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';
import { createChannelSelectMenu, createChatinputSubCommand } from 'utils/discord/component';

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    const { member } = interaction;
    if (!member) return;

    await interaction.reply({
        ephemeral: true,
        content: '이동하실 보이스 채널을 선택해주세요.',
        components: [
            createChannelSelectMenu('select voice move', {
                placeholder: '보이스 채널 선택',
                min_values: 1,
                max_values: 1,
                channel_types: [ChannelType.GuildVoice, ChannelType.GuildStageVoice],
            }),
        ],
    });
};

const api = createChatinputSubCommand(
    {
        description: '보이스 채널을 이동합니다.',
    },
    __filename
);

export const isAdmin = true; // 봇 관리자만 사용 가능
export default api;
