import { selectComponentPagingMenuKey } from 'components/systemComponent';
import { TextInputStyle } from 'discord-api-types/v10';
import { MessageInteraction } from 'fastify-discord';
import { createTextInput } from 'utils/discord/component';

/**
 *
 * 쿼리키 페이징 처리
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, ...params: string[]) => {
    const [page, key] = params;
    console.log('컴포넌트 수신', params);

    switch (page) {
        case 'page': // 검색
            // 모달 띄워서 검색조건 입력`
            await interaction.model({
                custom_id: `key search ${key}`,
                title: '검색',
                components: [
                    createTextInput('value', TextInputStyle.Short, {
                        label: '검색어',
                        placeholder: '검색어를 입력해주세요.',
                        min_length: 1,
                        max_length: 20,
                        required: true,
                    }),
                ],
            });
            interaction.remove();
            break;
        case 'back': // 검색
            interaction.edit({ components: await selectComponentPagingMenuKey(key, 0, {}) });
            break;
        default: // 페이징
            interaction.edit({
                components: await selectComponentPagingMenuKey(key, Number(page)),
            });
            break;
    }
};
