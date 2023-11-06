import { MessageMenuInteraction } from 'interactions/message';

import { editerComponent } from 'components/systemComponent';
import { getEmbedDtilByEmbed } from 'controllers/embed';
import { ButtonStyle, ComponentType } from 'discord-api-types/v10';

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
    const result = await getEmbedDtilByEmbed(embed_id);

    if (!result) {
        return interaction.reply({ content: '해당 메세지를 찾을 수 없습니다.', ephemeral: true });
    }
    const { embed, content } = result;

    const id = `embed edit ${embed_id}`;

    interaction.reply({
        content,
        embeds: [embed],
        ephemeral: true,
        components: [
            editerComponent('embed edit', [
                {
                    type: ComponentType.Button,
                    style: ButtonStyle.Success,
                    label: '필드 수정',
                    custom_id: `${id} option`,
                },
                {
                    type: ComponentType.Button,
                    label: '새로고침',
                    style: ButtonStyle.Danger,
                    custom_id: `${id} reload`,
                },
            ]),
        ],
    });
};
