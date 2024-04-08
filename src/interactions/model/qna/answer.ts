import { messageEdit } from 'components/discord';
import { updateQnaQuestion } from 'controllers/component/qna';
import { selectQnaTypes } from 'controllers/guild/qna';
import { RESTPostAPIChannelMessageJSONBody } from 'discord-api-types/v10';
import { MessageMenuInteraction } from 'interactions/message';
import { createActionRow, createSuccessButton } from 'utils/discord/component';
import { ParseInt } from 'utils/object';
import redis, { REDIS_KEY } from 'utils/redis';

/**
 * 질문을 작성합니다.
 * @param interaction
 */
export const exec = async (
    interaction: MessageMenuInteraction,
    values: Record<string, string>,
    questionId: string,
    typeId: string,
    messageId: string
) => {
    const { guild_id, user, member, channel } = interaction;
    if (!guild_id || !member) return;

    const userId = user?.id || member?.user.id;
    await interaction.differ({ ephemeral: true });
    const [item] = await selectQnaTypes(ParseInt(typeId));
    const { content } = values;

    if (!item) {
        return interaction.reply({
            content: '질문 유형을 찾을 수 없습니다.',
            ephemeral: true,
        });
    }

    updateQnaQuestion(ParseInt(questionId), {
        answer: content,
        answer_id: userId,
    })
        .then(async () => {
            interaction.reply({
                content: '답변을 등록하였습니다.',
                ephemeral: true,
            });

            const originMessage = await redis.get(REDIS_KEY.DISCORD.ANSWER_MESSAGE(channel.id, messageId));

            if (originMessage) {
                const { embeds } = JSON.parse(originMessage) as RESTPostAPIChannelMessageJSONBody;
                if (!embeds) return;
                const embed = embeds[0];

                embed.description = `${embed.description}\n\nA. ${
                    item.reader_yn ? content : '비공개로 답변이 등록되었습니다.'
                }`;

                messageEdit(channel.id, messageId, {
                    embeds: [embed],
                    components: [
                        createActionRow(
                            createSuccessButton(`qna show ${questionId}`, {
                                label: '질문 / 답변 보기',
                                emoji: { name: '👀' },
                            })
                        ),
                    ],
                });
            }
        })
        .catch(e => {
            //
            console.log(e);
        });
};
