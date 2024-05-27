import { ecsTaskState, liveState } from 'controllers/log';
import dayjs from 'dayjs';
import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';
import { createChatinputCommand, createEmbed } from 'utils/discord/component';
import { lastServerRequset } from 'utils/serverState';

const { version } = require('../../../package.json');

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    const { create_at, ids, revision, total } = await ecsTaskState();
    const { time } = await liveState();

    interaction.reply({
        embeds: [
            createEmbed({
                title: '현재 상태',
                description: `
- Version: ${version}
- Revision: ECS.${revision}
- Total: ${total.toLocaleString()}
- Request: ${lastServerRequset.toLocaleString()} req/m
- Live Sendtime : ${time} sec

총 ${ids.length.toLocaleString()}개의 서버가 동작하고 있으며,
각 서버당 ${Math.round(total / ids.length).toLocaleString()}개의 알림을 처리하고 있습니다.


* 알림 종류별로 처리 속도가 상이할 수 있습니다.
\`알림 처리 속도는 분당 ${(60 * ids.length).toLocaleString()}개 입니다.\`
                    `,
                thumbnail: {
                    url: 'https://cdn.orefinger.click/post/466950273928134666/3ee49895-2ac5-48ba-a45c-5855a7d45ee1.png',
                },
                timestamp: dayjs(create_at).add(-9, 'h').format(),
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
