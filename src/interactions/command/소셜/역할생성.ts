import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import { AppChatInputInteraction } from 'fastify-discord';
import { SelectOptionType } from 'interactions/app';
import { createChatinputSubCommand } from 'utils/discord/component';

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    const { member } = interaction;
    if (!member) return;
};

const api = createChatinputSubCommand(
    {
        description: '역할을 생성 및 관리 합니다',
        options: [
            {
                type: ApplicationCommandOptionType.Role,
                description: '설정하실 역할을 선택해주세요',
                name: 'role',
                required: false,
            },
        ],
    },
    __filename
);

export const isAdmin = true; // 봇 관리자만 사용 가능
export default api;
