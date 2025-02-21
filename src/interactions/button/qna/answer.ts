import { selectQnaQuestion } from 'controllers/component/qna';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { MessageInteraction } from 'fastify-discord';
import { createTextParagraphInput } from 'utils/discord/component';

import { hasNot } from 'utils/discord/permission';
import { ParseInt } from 'utils/object';
import { REDIS_KEY, saveRedis } from 'utils/redis';

/**
 * 답변을 생성합니다.
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, questionId: string, typeId: string) => {
    const { guild_id, message, channel, member } = interaction;

    if (!guild_id || !member) return; // 길드만 가능한 명령어 입니다.

    const { permissions } = member;

    if (hasNot(permissions, PermissionFlagsBits.ManageChannels)) {
        return interaction.reply({
            content: '권한이 없습니다.',
            ephemeral: true,
        });
    }

    await saveRedis(
        REDIS_KEY.DISCORD.ANSWER_MESSAGE(channel.id, message.id),
        {
            embeds: message.embeds,
            components: message.components,
        },
        60 * 60 * 60
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
