import { selectEmbedUserBaseEditByModel, upsertEmbedUser } from 'controllers/embed';
import { MessageInteraction } from 'fastify-discord';

/**
 *
 * 컴포넌트 action row 수정
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, target: string) => {
    const { user, member } = interaction;

    const user_id = user?.id || member?.user.id;
    const { insertId } = await upsertEmbedUser({
        use_yn: 'N',
        title: '제목',
        create_user: user_id,
    });

    const model = await selectEmbedUserBaseEditByModel(`${insertId}`);

    interaction.model({
        ...model,
        custom_id: `embed edit ${insertId}`,
    });
};
