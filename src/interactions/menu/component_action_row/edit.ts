import { UpdateYNConnection, updateComponentActionRowConnect } from 'controllers/component';
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

    switch (target) {
        case 'option': {
            const { values } = interaction;
            // 컴포넌트 하위 옵션 변경
            try {
                const componentActionLow = components?.find(component =>
                    component.components.find(component => 'custom_id' in component && component?.custom_id === custom_id)
                );
                if (!componentActionLow) throw new Error('컴포넌트를 찾을 수 없습니다.');
                const componentsMenu = componentActionLow.components[0] as APIStringSelectComponent;

                await updateComponentActionRowConnect(
                    component_id,
                    componentsMenu.options.map(({ value }) => ({
                        option_id: parseInt(value),
                        value: values.includes(value) ? 'Y' : 'N',
                    })) as UpdateYNConnection[]
                );

                interaction.reply({ content: '옵션 변경에 성공했습니다.', ephemeral: true });
            } catch (error) {
                interaction.reply({ content: '옵션 변경에 실패했습니다.', ephemeral: true });
            }
            break;
        }
        default:
            interaction.reply({ content: '컴포넌트 수정에 실패했습니다.', ephemeral: true });
            break;
    }
};
