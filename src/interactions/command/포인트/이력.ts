import { getPointLogs } from 'controllers/point';
import dayjs from 'dayjs';
import { AppChatInputInteraction } from 'fastify-discord';
import { SelectOptionType } from 'interactions/app';

import { createChatinputCommand } from 'utils/discord/component';

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    const { user, member } = interaction;
    const userId = user?.id || member?.user.id;

    const { point, logs } = await getPointLogs(userId || '');

    interaction.reply({
        ephemeral: true,
        content: `현재 포인트: ${point.toLocaleString()}점`,
        embeds: [
            {
                title: '포인트 이력',
                description: `
${logs
    .map(log => `<t:${dayjs(log.create_at).unix()}:R> : ${log.message} (${log.point_old.toLocaleString()}`)
    .join('\n')}
                `,
            },
        ],
    });
};

const api = createChatinputCommand(
    {
        description: '현재 포인트와, 이력을 출력 합니다.',
    },
    __filename
);
export default api;
