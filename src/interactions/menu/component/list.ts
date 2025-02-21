import { MessageMenuInteraction } from 'fastify-discord';

import { editerComponent } from 'components/systemComponent';
import { selectComponentDtilByEmbed, selectComponentTypeList, selectComponentYnMenu } from 'controllers/component';
import { createDangerButton, createStringSelectMenu, createSuccessButton } from 'utils/discord/component';

/**
 *
 * 가이드 호출 - 디비처리용
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction) => {
    const {
        component,
        message: { components },
        values: [component_id],
    } = interaction;

    await interaction.differ({ ephemeral: true });
    const embed = await selectComponentDtilByEmbed(component_id);

    if (!embed) {
        interaction.reply({ content: '해당 메세지를 찾을 수 없습니다.', ephemeral: true });
    } else {
        const id = `component edit ${component_id}`;

        const ynMenu = await selectComponentYnMenu(component_id, 'component');
        await interaction.edit({ components });

        interaction.follow({
            content: `컴포넌트 정보를 수정합니다. - ${component_id}`,
            embeds: [embed],
            ephemeral: true,
            components: [
                editerComponent(id, [
                    // createSuccessButton(`${id} option`, {
                    //     label: '하위 옵션 추가',
                    //     disabled: ComponentType.StringSelect != type,
                    // }),
                    createSuccessButton(`${id} text`, {
                        label: '텍스트 수정',
                    }),
                    createDangerButton(`${id} reload`, {
                        label: '새로고침',
                    }),
                ]),
                createStringSelectMenu(`${id} type`, {
                    options: await selectComponentTypeList(component_id),
                    placeholder: '컴포넌트 타입을 선택해주세요.',
                    max_values: 1,
                    min_values: 1,
                }),
                createStringSelectMenu(`${id} yn`, {
                    options: ynMenu,
                    placeholder: '활성화 옵션을 선택해주세요.',
                    max_values: ynMenu.length,
                    min_values: 0,
                }),
            ],
        });
    }
};
