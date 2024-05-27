import { MessageInteraction } from 'interactions/message';

import { selectEmbedUserBaseEditByModel, selectEmbedUserDtilByEmbed, upsertEmbedUser } from 'controllers/embed';

import { messageCreate } from 'components/discord';
import { selectEmbed } from 'components/embed/userDtail';
import { getAuthbordeList } from 'controllers/guild/authDashbord';
import {
    createActionRow,
    createPrimaryButton,
    createTextParagraphInput,
    createTextShortInput,
} from 'utils/discord/component';
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
        case 'nick': {
            const { nick_name } = bord;
            interaction.model({
                custom_id: `rules nick ${auth_id}`,
                title: '닉네임 형식 변경',
                components: [
                    createTextShortInput('nick', {
                        label: '닉네임',
                        placeholder: '{target}]{nick}',
                        value: nick_name || '{target}]{nick}',
                        max_length: 100,
                        min_length: 1,
                        required: true,
                    }),
                    createTextParagraphInput('tmp', {
                        label: '닉네임 예시',
                        value: `
예시) {target}]{nick}
예시2) 시청자] {nick}
예시3) {nick} 트수

{target} : 인증 대상 플렛폼
{nick} : 사용자 닉네임
(최대 30자 까지 가능합니다.)
                        `,
                    }),
                ],
            });
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
