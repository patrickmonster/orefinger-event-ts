import { messageInteraction } from 'interactions/message';

import { attendance } from 'controllers/twitch';
import redis from 'utils/redis';

export const exec = async (interaction: messageInteraction) => {
    const { user, message } = interaction;

    let data; // 비동기 처리식
    const user_id = `attendance:${user?.id}`; // 키 조합식

    redis.get(user_id);
};

//  해당 명령은 등록 하지 않는 명령 입니다.
export default {
    alias: ['출석'],
};
