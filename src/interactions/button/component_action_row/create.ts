import { TextInputStyle } from 'discord-api-types/v10';
import { MessageInteraction } from 'fastify-discord';

import { createTextInput } from 'utils/discord/component';

/**
 *
 * 컴포넌트 action row 생성
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction) => {
    interaction.model({
        title: '컴포넌트 그룹 생성',
        custom_id: 'component_action_row create',
        components: [
            createTextInput('name', TextInputStyle.Short, {
                label: '이름',
                placeholder: '컴포넌트 그룹 이름을 입력해주세요.',
                required: true,
                max_length: 100,
                min_length: 1,
            }),
        ],
    });
};
