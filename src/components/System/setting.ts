//
import moment from 'moment';

import { getTextList } from 'controllers/text';
import { AppChatInputInteraction } from 'interactions/app';
import { MessageMenuInteraction } from 'interactions/message';

import { getComponentList } from 'controllers/component';
import menu from 'utils/menuComponent';

moment.locale('ko');
/**
 *
 * 데이터 출력 ( 페이징용 )
 * @param interaction
 */
export const textSelect = (interaction: MessageMenuInteraction | AppChatInputInteraction, custom_id: string) => {
    let page = 0;

    if ('values' in interaction) page = parseInt(interaction.values[0]) - 1;

    getTextList({ page, limit: 15 }, {}).then(({ page, total, list, totalPage }) => {
        interaction.reply({
            components: menu(
                {
                    custom_id,
                    placeholder: '텍스트를 선택 해 주세요!',
                    disabled: false,
                    max_values: 1,
                    min_values: 1,
                },
                ...list.map(({ text_id, tag, message, create_at, update_at }) => ({
                    label: `${tag || '설정된 테그가 없음'}`,
                    value: `${text_id}`,
                    description: `${message}`,
                    emoji: { name: '📝' },
                }))
            ),
            content: `페이지 ${page + 1} / ${totalPage} ( ${total}개 )`,
        });
    });
};

export const componentSelect = (interaction: MessageMenuInteraction | AppChatInputInteraction, custom_id: string) => {
    let page = 0;
    if ('values' in interaction) page = parseInt(interaction.values[0]) - 1;
    getComponentList({ page, limit: 15 }).then(({ page, limit, total, list, totalPage }) => {
        interaction.reply({
            components: menu({
                custom_id,
                placeholder: '컴포넌트를 선택 해 주세요!',
                disabled: false,
                max_values: 1,
                min_values: 1,
            }),
        });
    });
};
