import { MessageMenuInteraction } from 'interactions/message';

import { getMessage } from 'controllers/message';

/**
 *
 * 가이드 호출 - 디비처리용
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction) => {
    const {
        user,
        values: [message_id],
    } = interaction;

    let id = 14;
    switch (message_id) {
        case 'notice':
            id = 15;
            break;
        case 'auth':
            id = 16;
            break;
        default:
        case 'question':
            id = 14;
            break;
    }

    const message = await getMessage(user?.id || 0, id);
    if (!message) return;

    await interaction.reply(message);
};

//  해당 명령은 등록 하지 않는 명령 입니다.
export default {
    // alias: ['출석'],
};
