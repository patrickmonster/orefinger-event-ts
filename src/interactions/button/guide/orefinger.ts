import { MessageInteraction } from 'fastify-discord';

import { selectMessage } from 'controllers/message';

/**
 *
 * 가이드 호출 - 디비처리용
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction) => {
    const { user } = interaction;

    const message = await selectMessage(user?.id || '0', 13);

    if (!message) interaction.reply(message);
};

//  해당 명령은 등록 하지 않는 명령 입니다.
export default {
    // alias: ['출석'],
};
