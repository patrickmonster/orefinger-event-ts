import { selectComponentMenuKey } from 'components/systemComponent';
import { ComponentType } from 'discord-api-types/v10';
import { MessageInteraction } from 'interactions/message';

/**
 *
 * 쿼리키 페이징 처리
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, ...params: string[]) => {
    const { user, guild_id } = interaction;
    const [page, key] = params;
    console.log('컴포넌트 수신', params);

    switch (page) {
        case 'page': // 검색
            // 모달 띄워서 검색조건 입력`
            await interaction.model({
                custom_id: `key search ${key}`,
                title: '검색',
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                custom_id: `value`,
                                type: ComponentType.TextInput,
                                label: '검색어',
                                placeholder: '검색어를 입력해주세요.',
                                style: 1,
                                min_length: 1,
                                max_length: 20,
                                required: true,
                            },
                        ],
                    },
                ],
            });
            await interaction.remove();
            break;
        case 'back': // 검색
            interaction.edit({ components: await selectComponentMenuKey(key, 0, {}) });
            break;
        default: // 페이징
            interaction.edit({
                components: await selectComponentMenuKey(key, Number(page)),
            });
            break;
    }
};
