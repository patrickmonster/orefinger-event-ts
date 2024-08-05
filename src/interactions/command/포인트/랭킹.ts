import { selectPointRanking } from 'controllers/point';
import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';

import { createChatinputCommand } from 'utils/discord/component';

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    const { user, member } = interaction;
    const userId = user?.id || member?.user.id || '';

    await interaction.differ();

    const ranks = await selectPointRanking(userId);
    interaction.reply({
        embeds: [
            {
                title: '포인트 랭킹',
                description: ranks.map(rank => `${rank.rnk}위: ${rank.name} - ${rank.point}`).join('\n'),
            },
        ],
    });
};

const api = createChatinputCommand(
    {
        description: '포인트 소유 전채 랭킹을 출력 합니다.',
    },
    __filename
);
export default api;
