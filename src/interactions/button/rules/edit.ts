import { MessageInteraction } from 'interactions/message';

import { selectEmbedUserBaseEditByModel, selectEmbedUserDtilByEmbed, upsertEmbedUser } from 'controllers/embed';

import { messageCreate } from 'components/discord';
import { selectEmbed } from 'components/embed/userDtail';
import { getAuthbordeList } from 'controllers/guild/authDashbord';
import { createActionRow, createPrimaryButton } from 'utils/discord/component';
/**
 *
 * 온라인 알림 이벤트 등록
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, auth_id: string, target: string) => {
    const { guild_id, channel } = interaction;
    if (!guild_id) return;
    const [bord] = await getAuthbordeList(guild_id, auth_id);
    const { embed_id, auth_type, tag_kr } = bord;

    switch (target) {
        case 'print': {
            const { id } = channel;
            const { embed } = await selectEmbedUserDtilByEmbed(embed_id);
            await interaction.reply({ ephemeral: true, content: '데시보드 출력중...' });
            messageCreate(id, {
                embeds: embed ? [embed] : undefined,
                components: [
                    createActionRow(
                        createPrimaryButton(`rules oauth ${auth_type}`, {
                            label: `인증 - ${tag_kr}`,
                            emoji: { name: '🔐' },
                        })
                    ),
                ],
            })
                .then(() => {
                    interaction.reply({
                        ephemeral: true,
                        content: '출력되었습니다.',
                    });
                })
                .catch(e => {
                    console.log(e.response.data);
                    interaction.reply({
                        content: '데시보드 출력에 실패 하였습니다 X﹏X - 관리자에게 문의 바랍니다',
                    });
                });
            break;
        }
        case 'reload': {
            await selectEmbed(interaction, embed_id);
            break;
        }
        case 'edit': {
            // 모달처리
            interaction.model({
                ...(await selectEmbedUserBaseEditByModel(embed_id)),
                custom_id: `rules edit ${embed_id}`,
            });
            break;
        }
        case 'delete': {
            const { embed_id } = bord;
            const { user, member } = interaction;
            const user_id = user?.id || member?.user.id;

            upsertEmbedUser(
                {
                    use_yn: 'N',
                    update_user: user_id,
                },
                embed_id
            )
                .then(() => {
                    interaction.edit({
                        content: '삭제되었습니다.',
                    });
                })
                .catch(e => {
                    interaction.edit({
                        content: '삭제에 실패하였습니다.',
                    });
                });

            break;
        }
    }
};
