import { TextInputStyle } from 'discord-api-types/v10';
import { MessageInteraction } from 'fastify-discord';
import { createTextInput } from 'utils/discord/component';

/**
 *
 * 컴포넌트 action row 수정
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction) => {
    interaction.model({
        title: '텍스트 생성',
        components: [
            createTextInput('tag', TextInputStyle.Short, {
                label: '이름',
                placeholder: '이름을 입력해주세요.',
                min_length: 1,
                max_length: 100,
                required: true,
            }),
            createTextInput('message', TextInputStyle.Short, {
                label: '내용',
                min_length: 1,
                max_length: 100,
                required: true,
            }),
        ],
        custom_id: 'text create',
    });
};
