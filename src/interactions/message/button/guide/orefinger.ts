import { messageInteraction } from 'interactions/message';

import { getMessage } from 'controllers/message';

/**
 *
 * 가이드 호출 - 디비처리용
 * @param interaction
 */
export const exec = async (interaction: messageInteraction) => {
    const { user } = interaction;

    const message = await getMessage(user?.id || '0', 13);

    if (!message) interaction.re(message);
};

//  해당 명령은 등록 하지 않는 명령 입니다.
export default {
    // alias: ['출석'],
};
