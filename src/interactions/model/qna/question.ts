import { messageCreate, messageDelete } from 'components/discord';
import { sendNoticeByBord } from 'components/notice';
import { insertQnaQuestion } from 'controllers/component/qna';
import { selectQnaTypes } from 'controllers/guild/qna';
import { RESTPostAPIChannelMessageJSONBody } from 'discord-api-types/v10';
import { MessageMenuInteraction } from 'fastify-discord';
import { createActionRow, createSuccessButton } from 'utils/discord/component';
import { ParseInt } from 'utils/object';
import redis, { REDIS_KEY } from 'utils/redis';

/**
 * 질문을 작성합니다.
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, values: Record<string, string>, typeId: string) => {
    const { guild_id, user, member, channel } = interaction;
    if (!guild_id || !member) return;

    const userId = user?.id || member?.user.id;
    const userAuthor = user || member?.user;
    await interaction.differ({ ephemeral: true });
    const [item] = await selectQnaTypes(ParseInt(typeId));
    const { title, content } = values;

    if (!item) {
        return interaction.reply({
            content: '질문 유형을 찾을 수 없습니다.',
            ephemeral: true,
        });
    }

    const author = {
        name: member.nick || userAuthor.global_name || userAuthor.username,
        icon_url:
            member.avatar || user?.avatar
                ? `https://cdn.discordapp.com/avatars/${userId}/${member.avatar || user?.avatar}.png`
                : undefined,
    };

    insertQnaQuestion({
        auth_id: userId,
        title,
        description: content,
        use_yn: 'Y',
    })
        .then(async ({ insertId }) => {
            interaction.reply({
                content: '질문을 등록하였습니다.',
                ephemeral: true,
            });

            const originMessage = await redis.get(REDIS_KEY.DISCORD.LAST_MESSAGE(channel.id));

            if (originMessage) {
                const { embeds, components, id } = JSON.parse(originMessage) as RESTPostAPIChannelMessageJSONBody & {
                    id: string;
                };
                await messageCreate(channel.id, {
                    embeds: [
                        {
                            author: item.user_yn ? author : { name: '비공개' },
                            title,
                            description: `
Q. ${item.writer_yn ? content : '비밀글 입니다.'}
                            `,
                        },
                    ],
                    components: [
                        createActionRow(
                            createSuccessButton(`qna answer ${insertId} ${typeId}`, {
                                label: '답변하기',
                                emoji: { name: '📝' },
                            })
                        ),
                    ],
                });
                await messageDelete(channel.id, id);
                await messageCreate(channel.id, {
                    embeds,
                    components,
                });
            }

            sendNoticeByBord(guild_id || '0', `10`, {
                message: `
질문이 등록 되었습니다.
Q : ${title}
${item.writer_yn ? content : '비밀글 입니다.'}
                `,
            });
        })
        .catch(e => {
            //
            console.log(e);
        });
};
