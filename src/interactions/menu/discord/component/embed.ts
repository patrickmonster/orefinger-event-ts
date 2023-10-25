import { MessageMenuInteraction } from 'interactions/message';

import { getEmbedDtilByEmbed } from 'controllers/embed';

/**
 *
 * 가이드 호출 - 디비처리용
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction) => {
    const {
        values: [embed_id],
    } = interaction;

    await interaction.differ({ ephemeral: true });
    const embed = await getEmbedDtilByEmbed(embed_id);

    console.log('embed', embed);

    if (!embed) {
        interaction.reply({ content: '해당 메세지를 찾을 수 없습니다.', ephemeral: true });
    } else {
        interaction.reply({ embeds: [embed] });
    }
};
