import { getQNAType } from 'controllers/guild/qna';
import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';
import { createChatinputSubCommand, createStringSelectMenu } from 'utils/discord/component';

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    const { guild_id } = interaction;

    if (!guild_id) return interaction.reply({ content: '서버 정보를 불러오는데 실패했습니다', ephemeral: true });

    interaction.reply({
        content: '질의/ 응답을 생성 및 관리합니다',
        components: [
            createStringSelectMenu('qna list', {
                placeholder: '선택해주세요',
                options: await getQNAType(guild_id),
            }),
        ],
    });
};

const api = createChatinputSubCommand(
    {
        description: '질의/ 응답을 생성 및 관리합니다',
    },
    __filename
);

export const isAdmin = false; // 봇 관리자만 사용 가능
export default api;
