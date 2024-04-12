import { ecsTaskState } from 'controllers/log';
import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';
import { createChatinputCommand } from 'utils/discord/component';
import { serverRequset } from 'utils/serverState';

const { version } = require('../../../package.json');

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    const { create_at, ids, revision, total } = await ecsTaskState();

    //
    interaction.reply({
        embeds: [
            {
                title: '현재 상태',
                description: `
- Version: ${version}
- Revision: ECS.${revision}
- Total: ${total.toLocaleString()}
- Request: ${serverRequset.toLocaleString()} req/m

총 ${ids.length.toLocaleString()}개의 서버가 동작하고 있으며,
각 서버당, ${Math.round(total / ids.length).toLocaleString()}개의 알림을 처리하고 있습니다.

\`알림 처리 속도는 분당 ${(60 * ids.length).toLocaleString()}개 입니다.\`
                `,
                footer: {
                    text: 'Create by.뚱이(Patrickmonster)',
                    icon_url:
                        'https://cdn.orefinger.click/post/466950273928134666/d2d0cc31-a00e-414a-aee9-60b2227ce42c.png',
                },
                timestamp: create_at,
            },
        ],
    });
};

const api = createChatinputCommand(
    {
        description: '연결된 계정을 관리 합니다.',
    },
    __filename
);

// 인터렉션 이벤트
export default api;
