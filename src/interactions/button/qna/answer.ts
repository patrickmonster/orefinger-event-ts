import { selectQnaQuestion } from 'controllers/component/qna';
import { ParseInt } from 'controllers/notice';
import { MessageInteraction } from 'interactions/message';
import { createTextParagraphInput } from 'utils/discord/component';

import redis, { REDIS_KEY } from 'utils/redis';

/**
 * 답변을 생성합니다.
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, questionId: string, typeId: string) => {
    const { guild_id, message, channel } = interaction;

    if (!guild_id) return; // 길드만 가능한 명령어 입니다.

    await redis.set(
        REDIS_KEY.DISCORD.ANSWER_MESSAGE(channel.id, message.id),
        JSON.stringify({
            embeds: message.embeds,
            components: message.components,
        }),
        {
            EX: 60 * 60 * 60,
        }
    );

    const origin = await selectQnaQuestion(ParseInt(questionId));

    if (!origin) {
        return interaction.reply({
            content: '질문을 찾을 수 없습니다.',
            ephemeral: true,
        });
    }

    interaction.model({
        title: `${origin.title} 답변하기`,
        custom_id: `qna answer ${questionId} ${typeId} ${message.id}`,
        components: [
            createTextParagraphInput('origin', {
                label: '본문',
                placeholder: `${origin.description}`,
                value: `${origin.description}`,
                min_length: 1,
            }),
            createTextParagraphInput('content', {
                label: '내용',
                placeholder: '내용을 입력 해 주세요.',
                min_length: 1,
                required: true,
            }),
        ],
    });
};
