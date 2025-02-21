import { selectEmbedUserBaseEditByModel, upsertEmbedUser } from 'controllers/embed';
import { upsertAuthBorde } from 'controllers/guild/authDashbord';
import { MessageInteraction } from 'fastify-discord';

/**
 *
 * 임베드 user수정
 * TODO: 임베드생성 항목 추가
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, auth_type: string) => {
    const { guild_id, user, member } = interaction;

    if (!guild_id) return;

    const user_id = user?.id || member?.user.id;
    const { insertId } = await upsertEmbedUser({
        use_yn: 'N',
        title: '규칙을 확인해주세요!',
        description: `해당 서버는, 2단계(OAuth2.0)인증을 지원하여 쾌적환 환경을 만들기 위하여 노력 하고 있습니다!`,
        create_user: user_id,
    });

    await upsertAuthBorde(
        {
            embed_id: `${insertId}`,
        },
        {
            guild_id,
            type: auth_type,
        }
    );

    const model = await selectEmbedUserBaseEditByModel(`${insertId}`);

    interaction.model({
        ...model,
        custom_id: `rules edit ${insertId} edit`,
    });
};
