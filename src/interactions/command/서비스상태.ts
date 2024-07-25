import { ecsTaskState, liveState } from 'controllers/log';
import dayjs from 'dayjs';
import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';
import { createChatinputCommand, createEmbed } from 'utils/discord/component';

const { version } = require('../../../package.json');

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    const { ids, total } = await ecsTaskState();
    const { time, c } = await liveState();

    interaction.reply({
        embeds: [
            createEmbed({
                title: '현재 상태',
                description: `
- Version: ${version}
- Total: ${total.toLocaleString()}
- Live Sendtime : ${time} sec (최근3달 ${c.toLocaleString()}건 평균)
- EC2 Task: ${ids.length}개

* 알림 종류별로 처리 속도가 상이할 수 있습니다.
\`알림 처리 속도는 분당 ${(60 * ids.length).toLocaleString()}개 입니다.\`
                    `,
                thumbnail: {
                    url: 'https://cdn.orefinger.click/post/466950273928134666/3ee49895-2ac5-48ba-a45c-5855a7d45ee1.png',
                },
                timestamp: dayjs(process.uptime()).add(-9, 'h').format(),
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
