import { liveState } from 'controllers/log';
import dayjs from 'dayjs';
import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';
import { createChatinputCommand, createEmbed } from 'utils/discord/component';
import { getTimeStringSeconds } from 'utils/object';
import { catchRedis } from 'utils/redis';

const { version } = require('../../../package.json');

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    const { time, c, notices, chnnels } = await catchRedis(
        'server:status',
        async () => {
            const { time, c, notices, chnnels } = await liveState();

            return {
                time,
                c,
                notices,
                chnnels,
            };
        },
        60 * 60 * 1
    );

    interaction.reply({
        embeds: [
            createEmbed({
                title: '현재 상태',
                description: `
- Version: ${version}
- EC2 Task: N/A (현재 미지원)
- Running : ${getTimeStringSeconds(process.uptime())}
- Live Sending delay : ${time} sec (최근3달 ${c.toLocaleString()}건 평균)
- Channel: ${chnnels.toLocaleString()}개
- Total: ${notices.reduce((a, b) => a + b.cnt, 0).toLocaleString()}건
${notices.map(({ cnt, tag }) => `\t⌞ ${tag}: \t${cnt.toLocaleString()}건`).join('\n') || '- 알림이 없습니다.'}


* 알림 종류별로 처리 속도가 상이할 수 있습니다.
\`알림 처리 속도는 분당 ${(120 * 4).toLocaleString()}개 입니다.\`
                    `,
                thumbnail: {
                    url: 'https://cdn.orefinger.click/post/466950273928134666/3ee49895-2ac5-48ba-a45c-5855a7d45ee1.png',
                },
                timestamp: dayjs().add(-9, 'h').format(),
            }),
        ],
    });
};

const api = createChatinputCommand(
    {
        description: '서비스 상태를 확인합니다.',
    },
    __filename
);

// 인터렉션 이벤트
export default api;
