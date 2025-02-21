import axios from 'axios';
import { AppChatInputInteraction } from 'fastify-discord';
import { SelectOptionType } from 'interactions/app';
import { createChatinputCommand } from 'utils/discord/component';

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    const {
        data: [item],
    } = await axios.get<{ id: string; url: string }[]>('https://api.thecatapi.com/v1/images/search');

    await interaction.reply({
        embeds: [
            {
                image: { url: `${item.url}` },
                footer: {
                    text: 'From thecatapi',
                },
            },
        ],
    });
};

const api = createChatinputCommand(
    {
        description: '고양이를 불러옵니다',
    },
    __filename
);

// 인터렉션 이벤트
export default api;
