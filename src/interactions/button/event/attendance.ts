import { MessageInteraction } from 'interactions/message';
import { RESTPostAPIChannelMessage } from 'plugins/discord';

import { getAdvertisement } from 'controllers/message';
import { attendance } from 'controllers/twitch';

import createCalender from 'utils/createCalender';
import { createEmbed } from 'utils/discord/component';
import redis from 'utils/redis';

const selectMessage = async (broadcaster_user_id: string, user_id: string): Promise<RESTPostAPIChannelMessage> => {
    const { is_success, list } = await attendance(user_id, broadcaster_user_id);

    let count = 0;

    // 개근일자
    for (const { attendance_time } of list) {
        if (attendance_time) count++;
        else break;
    }

    const pin = list
        .filter(({ attendance_time }) => attendance_time)
        .map(({ attendance_time }) => new Date(attendance_time)); // 출석회수
    const spin = list.map(({ create_at }) => new Date(create_at)); // 방송횟수
    return {
        content: is_success ? '출석체크가 완료되었습니다!' : '이미 출석이 완료되었습니다!',
        ephemeral: true,
        embeds: [
            createEmbed({
                url: 'https://toss.me/방송알리미',
                color: 0x9147ff,
                description: `
출석율 : ${((pin.length / spin.length) * 100).toFixed(2)}% (${pin.length}/${spin.length})
출석 : ${count - 1 > 0 ? count + '회 연속' : '연속된 데이터가 없네요 8ㅅ8'}

### 출석은 방송 알림이 오면 출석을 눌러주세요!
 - 방송정보를 통하여 출석을 체크합니다.
===========================
\`\`\`ansi
${createCalender(new Date(), ...pin)}
\`\`\``,
            }),
        ],
    };
};

export const exec = async (interaction: MessageInteraction, broadcaster_user_id: string, game_id: string | number) => {
    const { user, member } = interaction;

    const userId = `${user?.id || member?.user.id}`;
    const redisId = `attendance:${userId}`; // 키 조합식

    if (user === null)
        return interaction
            .differ({ ephemeral: true })
            .then(
                async send => await interaction.reply({ content: '처리 불가능한 상태. - 사용자를 찾을 수 없습니다.' })
            );

    await interaction.differ({ ephemeral: true });

    const advertisement = await getAdvertisement(game_id); // 광고 로딩
    redis
        .get(redisId)
        .then(async data => {
            let message = data ? JSON.parse(data) : null;
            if (!message) {
                message = await selectMessage(broadcaster_user_id, userId);
                redis.set(
                    redisId,
                    JSON.stringify(message),
                    // 10분
                    'EX',
                    60 * 10
                );
            } else redis.expire(redisId, 60 * 10); // 연장

            message.embeds?.push(advertisement);
            await interaction.reply(message);
        })
        .catch(err => {
            console.log(err);
            interaction.reply({
                content: '처리 불가능한 상태.',
                embeds: [advertisement],
            });
        });
};

//  해당 명령은 등록 하지 않는 명령 입니다.
export default {
    // alias: ['출석'],
};
