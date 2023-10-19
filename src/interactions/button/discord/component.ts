import { basename } from 'path';

import { MessageInteraction } from 'interactions/message';

const name = basename(__filename, __filename.endsWith('js') ? '.js' : '.ts');

/**
 *
 * 온라인 알림 이벤트 등록
 * @param interaction
 */
export const exec = async (interaction: MessageInteraction, [command]: string[]) => {
    const { user, guild_id } = interaction;
};

export default {
    alias: [name, 'rule'],
};
