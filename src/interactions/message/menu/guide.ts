import { messageInteraction } from 'interactions/message';

import { getMessage } from 'controllers/message';

/**
 *
 * 가이드 호출 - 디비처리용
 * @param interaction
 */
export const exec = async (interaction: messageInteraction) => {
    const { user, data } = interaction;
    const {} = data;

    switch (values[0]) {
        case 'question':
            interaction.reMessage(14);
            break;
        case 'notice':
            interaction.reMessage(15);
            break;
        case 'auth':
            interaction.reMessage(16);
            break;
    }
};

//  해당 명령은 등록 하지 않는 명령 입니다.
export default {
    // alias: ['출석'],
};
