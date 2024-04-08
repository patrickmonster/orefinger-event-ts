import { selectQnaQuestion } from 'controllers/component/qna';
import { MessageInteraction } from 'interactions/message';
import { ParseInt } from 'utils/object';

/**
 *
 * 답변을 봅니다.
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, embedId: string) => {
    const { guild_id, user, member } = interaction;
    if (!guild_id) return;
    const userId = user?.id || member?.user.id;

    const data = await selectQnaQuestion(ParseInt(embedId), userId);

    if (!data) {
        return interaction.reply({
            content: '질문을 찾을 수 없습니다.',
            ephemeral: true,
        });
    }

    const { answer, auth_id, create_at, description, title, answer_id, idx } = data;

    interaction.reply({
        content: `
질문자: <@${auth_id}>
답변자: <@${answer_id}>
        `,
        embeds: [
            {
                title,
                description: `
Q. ${description}
A. ${answer}
                `,
                fields: [
                    {
                        name: 'ID',
                        value: `ANSWER-${idx}`,
                    },
                ],
                timestamp: create_at,
            },
        ],
        ephemeral: true,
    });
};
