import { createChannelListGuide } from 'components/discord';
import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';
import { createChatinputCommand } from 'utils/discord/component';

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    await interaction.differ({ ephemeral: false });

    const { guild_id } = interaction;
    if (!guild_id)
        return interaction.reply({
            content: '길드 정보를 가져올 수 없습니다.',
            ephemeral: true,
        });

    const content = await createChannelListGuide(guild_id);
    await interaction.reply({ content });

    await interaction.follow({
        ephemeral: true,
        embeds: [
            {
                title: '채널리스트 가이드',
                description: `
채널리스트 가이드를 생성하였습니다.

\`마우스 우측 - 복사하기\` 를 이용하여
원하는 곳에 붙여넣기 해주세요.
                `,
                color: 0x00ff00,
                image: {
                    url: 'https://cdn.orefinger.click/upload/466950273928134666/e458ca06-5014-45da-9e80-4bba885cf980.png',
                },
            },
        ],
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
