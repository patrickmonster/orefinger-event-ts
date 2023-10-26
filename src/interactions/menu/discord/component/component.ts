import { MessageMenuInteraction } from 'interactions/message';

import { editerComponent, editerComponentEmbedTemplate } from 'components/systemComponent';
import { getComponentDtilByEmbed } from 'controllers/component';

/**
 *
 * 가이드 호출 - 디비처리용
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction) => {
    const {
        user,
        values: [component_id],
    } = interaction;

    await interaction.differ({ ephemeral: true });
    const embed = await getComponentDtilByEmbed(component_id);

    console.log('embed', embed);

    if (!embed) {
        interaction.reply({ content: '해당 메세지를 찾을 수 없습니다.', ephemeral: true });
    } else {
        interaction.reply({
            content: `embed 정보를 수정합니다. - ${component_id}`,
            embeds: [embed],
            ephemeral: true,
            components: [editerComponent('component edit'), editerComponentEmbedTemplate('component edit')],
        });
    }
};
