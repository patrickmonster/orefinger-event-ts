import { messageInteraction } from 'interactions/message';

import { attendance } from 'controllers/twitch';
import redis from 'utils/redis';

export const exec = async (interaction: messageInteraction, broadcaster_user_id: string) => {
    const { user } = interaction;

    let data; // 비동기 처리식
    const user_id = `attendance:${user?.id}`; // 키 조합식

    if (user === null) {
        return interaction.deffer(/*{ ephemeral: true }*/).then(async send => send({ content: '처리 불가능한 상태.' }));
    }

    interaction.deffer(/*{ ephemeral: true }*/).then(async send => {
        const message = await redis
            .get(user_id)
            .then(async message => {
                if (message) {
                    send({
                        content: '이미 출석 하셨습니다.',
                        // ...message,
                    });
                } else {
                    data = await attendance(`${user?.id}`, broadcaster_user_id);
                    send({
                        content: data,
                        // ...message,
                    });
                    redis.set(user_id, data);
                }

                // if (message) {
                //     interaction.reply('이미 출석 하셨습니다.');
                // } else {
                //     data = attendance(user?.id, user?.login, user?.display_name);
                //     interaction.reply(data);
                //     redis.set(user_id, message);
                // }
            })
            .catch(err => {
                console.log(err);
                send({
                    content: '처리 불가능한 상태.',
                    // ...message,
                });
            });
    });
};

//  해당 명령은 등록 하지 않는 명령 입니다.
export default {
    alias: ['출석'],
};
