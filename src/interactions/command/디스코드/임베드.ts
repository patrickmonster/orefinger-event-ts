import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';
import { createChatinputCommand } from 'utils/discord/component';

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    await interaction.differ({ ephemeral: false });

    const { guild_id } = interaction;
    if (!guild_id) return;
};

const api = createChatinputCommand(
    {
        description: '메세지를 생성합니다.',
        options: [
            {
                description: '길드 ID',
                name: 'guild_id',
                required: true,
                type: ApplicationCommandOptionType.String,
            },
        ],
    },
    __filename
);

export const isAdmin = true; // 봇 관리자만 사용 가능
export default api;
