import { upsertAuthBorde } from 'controllers/guild/authDashbord';
import { MessageMenuInteraction } from 'fastify-discord';

/**
 *
 * 닉네임 형식 수정
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, values: Record<string, string>, auth_type: string) => {
    const { guild_id } = interaction;

    await interaction.differ({ ephemeral: true });
    if (!guild_id) return;

    upsertAuthBorde(
        {
            nick_name: values.nick,
        },
        {
            guild_id,
            type: auth_type,
        }
    )
        .then(async () => {
            interaction.reply({ content: '닉네임이 수정되었습니다.', ephemeral: true });
        })
        .catch(e => {
            console.error(e);
            interaction.reply({ content: '닉네임 수정에 실패하였습니다.', ephemeral: true });
        });
};
