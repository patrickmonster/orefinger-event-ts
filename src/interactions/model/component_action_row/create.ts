import { selectComponentRowDtilByEmbed, upsertComponentActionRow } from 'controllers/component';
import { MessageMenuInteraction } from 'fastify-discord';

/**
 *
 * ActionRow 생성
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, values: Record<string, string>) => {
    const { insertId } = await upsertComponentActionRow(values);
    const embed = await selectComponentRowDtilByEmbed(insertId);
    if (!embed) return await interaction.edit({ content: '해당 메세지를 찾을 수 없습니다.', ephemeral: true });

    interaction.reply({
        ephemeral: true,
        content: '생성되었습니다!',
        embeds: [embed],
    });
};
