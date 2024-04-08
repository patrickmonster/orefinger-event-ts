import { selectEmbedUserBaseEditByModel, upsertEmbedUser } from 'controllers/embed';
import { upsertQnaBorde } from 'controllers/guild/qna';
import { MessageInteraction } from 'interactions/message';

/**
 *
 * 임베드 user수정
 * TODO: 임베드생성 항목 추가
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, qna_type: string) => {
    const { guild_id, user, member } = interaction;

    const user_id = user?.id || member?.user.id;
    const { insertId } = await upsertEmbedUser({
        use_yn: 'Y',
        title: '질문/ 답변',
        description: `궁금한 점이나, 문의사항이 있으시면 여기를 통해 남겨주세요!`,
        create_user: user_id,
    });

    if (!guild_id) return;

    await upsertQnaBorde(
        {
            embed_id: `${insertId}`,
        },
        {
            guild_id,
            type: qna_type,
        }
    );

    const model = await selectEmbedUserBaseEditByModel(`${insertId}`);

    interaction.model({
        ...model,
        custom_id: `rules edit ${insertId} edit`,
    });
};
