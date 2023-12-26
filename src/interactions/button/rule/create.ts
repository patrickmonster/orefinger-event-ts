import { selectEmbedUserBaseEditByModel, upsertEmbedUser } from 'controllers/embed';
import { upsertAuthBorde } from 'controllers/guild/authDashbord';
import { MessageInteraction } from 'interactions/message';

/**
 *
 * 임베드 user수정
 * TODO: 임베드생성 항목 추가
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, auth_type: string) => {
    const { guild_id } = interaction;
    const { insertId } = await upsertEmbedUser({ use_yn: 'N' });

    if (!guild_id) return;

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
        custom_id: `rule edit ${insertId} edit`,
    });
};
