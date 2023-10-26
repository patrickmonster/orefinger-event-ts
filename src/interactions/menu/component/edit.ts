import { updateComponent } from 'controllers/component';
import { APIStringSelectComponent } from 'discord-api-types/v10';
import { MessageMenuInteraction } from 'interactions/message';

/**
 *
 * 가이드 호출 - 디비처리용
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, component_id: string, target: string) => {
    const {
        user,
        custom_id,
        values: [select_id],
        message: {
            embeds: [embed],
            components,
        },
    } = interaction;

    // ?

    switch (target) {
        case 'type': // 타입 변경 메뉴
            try {
                const componentActionLow = components?.find(component =>
                    component.components.find(component => 'custom_id' in component && component?.custom_id === custom_id)
                );
                if (!componentActionLow) throw new Error('컴포넌트를 찾을 수 없습니다.');

                const componentsMenu = componentActionLow.components[0] as APIStringSelectComponent;

                componentsMenu.options.forEach(option => {
                    option.default = option.value === select_id;
                    return option;
                });

                const label = componentsMenu.options?.find(option => option.value === select_id)?.label;
                await updateComponent(component_id, { type_idx: parseInt(select_id) });
                await interaction.edit({
                    embeds: [
                        {
                            ...embed,
                            author: { name: label ?? '컴포넌트 타입 변경' },
                        },
                    ],
                    components,
                });
                interaction.reply({ content: '타입 변경에 성공했습니다.', ephemeral: true });
            } catch (error) {
                interaction.reply({ content: '타입 변경에 실패했습니다.', ephemeral: true });
            }
            break;
    }
};
