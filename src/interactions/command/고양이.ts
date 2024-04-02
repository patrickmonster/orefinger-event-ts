import axios from 'axios';
import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';
import { createChatinputCommand } from 'utils/discord/component';

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    const {
        data: { _id },
    } = await axios.get<{ _id: string }>('https://cataas.com/cat?json=true');

    await interaction.reply({
        embeds: [
            {
                image: { url: `https://cataas.com/cat/${_id}` },
                footer: {
                    text: 'From cataas API',
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
