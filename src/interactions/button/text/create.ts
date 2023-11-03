import { ComponentType, TextInputStyle } from 'discord-api-types/v10';
import { MessageInteraction } from 'interactions/message';

/**
 *
 * 컴포넌트 action row 수정
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction) => {
    interaction.model({
        title: '텍스트 생성',
        components: [
            {
                type: 1,
                components: [
                    {
                        type: ComponentType.TextInput,
                        style: TextInputStyle.Short,
                        label: '이름',
                        required: true,
                        custom_id: 'tag',
                        max_length: 100,
                        min_length: 1,
                    },
                ],
            },
            {
                type: 1,
                components: [
                    {
                        type: ComponentType.TextInput,
                        style: TextInputStyle.Paragraph,
                        label: '내용',
                        required: true,
                        custom_id: 'message',
                        max_length: 1000,
                        min_length: 1,
                    },
                ],
            },
        ],
        custom_id: 'text create',
    });
};
