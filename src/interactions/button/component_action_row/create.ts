import { ComponentType } from 'discord-api-types/v10';
import { MessageInteraction } from 'interactions/message';

/**
 *
 * 컴포넌트 action row 수정
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, component_row_id: string, type: string, component_id: string) => {
    const {
        component,
        message: { components },
        custom_id,
    } = interaction;
    //

    interaction.model({
        title: '컴포넌트 그룹 생성',
        components: [
            {
                type: 1,
                components: [
                    {
                        type: ComponentType.TextInput,
                        label: '이름',
                        style: 1,
                        required: true,
                        custom_id: 'name',
                        max_length: 100,
                        min_length: 1,
                    },
                ],
            },
        ],
        custom_id: 'component_action_row create',
    });
};
