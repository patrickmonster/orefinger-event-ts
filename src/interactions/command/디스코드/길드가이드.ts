import { createChannelListGuide } from 'components/discord';
import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';
import { createChatinputCommand } from 'utils/discord/component';

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    await interaction.differ({ ephemeral: true });

    const { guild_id } = interaction;
    if (!guild_id)
        return interaction.reply({
            content: '길드 정보를 가져올 수 없습니다.',
            ephemeral: true,
        });

    const content = await createChannelListGuide(guild_id);
    interaction.reply({
        content,
    });
};

const api = createChatinputCommand(
    {
        description: '길드 가이드 메세지를 생성합니다 (채널리스트)',
    },
    __filename
);

export const isAdmin = false; // 봇 관리자만 사용 가능
export default api;
