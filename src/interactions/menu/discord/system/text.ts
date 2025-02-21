import { MessageMenuInteraction } from 'fastify-discord';

import { getTextDtilByEmbeds } from 'controllers/util/text';

/**
 *
 * 가이드 호출 - 디비처리용
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction) => {
    const {
        values: [text_id],
    } = interaction;

    await interaction.differ({ ephemeral: true });
    const embed = await getTextDtilByEmbeds(text_id);

    if (!embed) {
        interaction.reply({ content: '해당 메세지를 찾을 수 없습니다.', ephemeral: true });
    } else {
        interaction.reply({ embeds: [embed] });
    }
};
