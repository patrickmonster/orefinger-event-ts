import { selectQnaTypes } from 'controllers/guild/qna';
import { MessageInteraction } from 'interactions/message';
import { createTextParagraphInput, createTextShortInput } from 'utils/discord/component';
import { ParseInt } from 'utils/object';

import redis, { REDIS_KEY } from 'utils/redis';

/**
 * 질문을 생성 합니다.
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, typeId: string, embedId: string) => {
    const { user, member, guild_id, message, channel } = interaction;

    if (!guild_id || !member) return; // 길드만 가능한 명령어 입니다.

    const { permissions } = member;

    // if (!permissions.has('MANAGE_GUILD')) {
    //     return interaction.reply({
    //         ephemeral: true,
    //         content: '권한이 없습니다.',
    //     });
    // }

    const [item] = await selectQnaTypes(ParseInt(typeId));
    if (!item) return null;

    await redis.set(
        REDIS_KEY.DISCORD.LAST_MESSAGE(channel.id),
        JSON.stringify({
            id: message.id,
            embeds: message.embeds,
            components: message.components,
        }),

        'EX',
        60 * 60 * 60
    );

    interaction.model({
        title: '어떤점이 궁금한가요?',
        custom_id: `qna question ${typeId} ${embedId}`,
        components: [
            createTextShortInput('title', {
                label: '제목',
                placeholder: '제목 요약을 입력 해 주세요.(해당요약은 무조건 공개됩니다.)',
                min_length: 1,
                max_length: 100,
                required: true,
            }),
            createTextParagraphInput('content', {
                label: '내용',
                placeholder: '내용을 입력 해 주세요.',
                min_length: 1,
                required: true,
            }),
            createTextShortInput('1', {
                label: '설명',
                value: `해당 내용은, ${item.description}`,
                placeholder: '-',
                min_length: 1,
                max_length: 1000,
                required: false,
            }),
        ],
    });
};
