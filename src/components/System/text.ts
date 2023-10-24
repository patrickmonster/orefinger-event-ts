//
import moment from 'moment';

import { getTextList } from 'controllers/text';
import { AppChatInputInteraction } from 'interactions/app';
import { MessageMenuInteraction } from 'interactions/message';

import menu from '../menu';

moment.locale('ko');
/**
 *
 * 데이터 출력 ( 페이징용 )
 * @param interaction
 */
export const textSelect = (interaction: MessageMenuInteraction | AppChatInputInteraction, custom_id: string) => {
    let page = 0;

    if ('values' in interaction) page = parseInt(interaction.values[0]) - 1;

    getTextList({ page, limit: 15 }, {}).then(({ page, limit, total, list, totalPage }) => {
        interaction.reply({
            components: menu(
                {
                    custom_id,
                    placeholder: '인증을 완료하실 계정을 선택 해 주세요!',
                    disabled: false,
                    max_values: 1,
                    min_values: 1,
                },
                ...list.map(({ text_id, tag, message, create_at, update_at }) => ({
                    label: `${tag}`,
                    value: `${text_id}`,
                    description: `${message} ${moment(create_at).format('YYYY년 MMM Do')}`,
                }))
            ),
        });
    });
};
