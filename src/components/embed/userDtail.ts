import { selectEmbedUserDtilByEmbed } from 'controllers/embed';
import { MessageInteraction } from 'interactions/message';

export const selectEmbed = async (interaction: MessageInteraction, embed_id: string) => {
    const data = await selectEmbedUserDtilByEmbed(embed_id);
    if (!data)
        return interaction.edit({
            content: '데이터가 없습니다.',
        });
    const { embed } = data;
    interaction.edit({
        embeds: [embed],
    });
};
