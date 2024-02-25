import { MessageInteraction } from 'interactions/message';

import { selectEmbedUserBaseEditByModel, selectEmbedUserDtilByEmbed, upsertEmbedUser } from 'controllers/embed';

import { getAuthbordeList } from 'controllers/guild/authDashbord';
/**
 *
 * 온라인 알림 이벤트 등록
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, auth_id: string, target: string) => {
    const { guild_id } = interaction;
    if (!guild_id) return;
    const [bord] = await getAuthbordeList(guild_id, auth_id);
    const { embed_id } = bord;

    switch (target) {
        case 'reload': {
            const { content, embed } = await selectEmbedUserDtilByEmbed(embed_id);
            interaction.edit({
                content,
                embeds: [embed],
            });
            break;
        }
        case 'edit': {
            const model = await selectEmbedUserBaseEditByModel(embed_id);

            // 모달처리
            interaction.model({
                ...model,
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
