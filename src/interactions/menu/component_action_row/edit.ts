import { upsertComponentActionRowConnect } from 'controllers/component';
import { APIStringSelectComponent } from 'discord-api-types/v10';
import { MessageMenuInteraction } from 'fastify-discord';
import { ComponentActionRowConnect } from 'interfaces/component';

/**
 *
 * 가이드 호출 - 디비처리용
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, component_id: string, target: string) => {
    const { component, values } = interaction;

    switch (target) {
        case 'option': {
            try {
                if (!component) throw new Error('컴포넌트를 찾을 수 없습니다.');
                const componentsMenu = component.components[0] as APIStringSelectComponent;

                await upsertComponentActionRowConnect(
                    componentsMenu.options.map(({ value }) => ({
                        component_row_id: parseInt(component_id),
                        component_id: parseInt(value),
                        use_yn: values.includes(value) ? 'Y' : 'N',
                    })) as ComponentActionRowConnect[]
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
