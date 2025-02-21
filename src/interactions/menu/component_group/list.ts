import { MessageMenuInteraction } from 'fastify-discord';

import { editerComponent } from 'components/systemComponent';
import { selectComponentConnectGroupDtilByEmbed } from 'controllers/component';
import { createSuccessButton } from 'utils/discord/component';

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
    const embed = await selectComponentConnectGroupDtilByEmbed(component_id);

    if (!embed) {
        interaction.reply({ content: '해당 메세지를 찾을 수 없습니다.', ephemeral: true });
    } else {
        const id = `component_group edit ${component_id}`;

        interaction.reply({
            content: `컴포넌트 정보를 수정합니다. - ${component_id}`,
            embeds: [embed],
            ephemeral: true,
            components: [
                editerComponent(id, [
                    createSuccessButton(`${id} option`, {
                        label: '하위 옵션 추가',
                    }),
                ]),
            ],
        });
    }
};
