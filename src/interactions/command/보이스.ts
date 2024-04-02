import { ChannelType } from 'discord-api-types/v10';
import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';
import { createChannelSelectMenu, createChatinputCommand } from 'utils/discord/component';

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

const api = createChatinputCommand(
    {
        description: '보이스 채널을 이동합니다.',
        default_member_permissions: '0',
        dm_permission: false,
    },
    __filename
);

// 인터렉션 이벤트
export default api;
