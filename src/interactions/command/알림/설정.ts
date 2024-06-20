import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';

import { createComponentSelectMenuByComponentPagingMenuByKey } from 'components/systemComponent';
import QUERY from 'controllers/component/noticeListQuerys';
import { createChatinputCommand } from 'utils/discord/component';

export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    const { guild_id } = interaction;

    await interaction.differ({ ephemeral: true });
    if (!guild_id) return;
    // TODO: 알림 설정 - 개인 메세지도 추후....

    interaction.reply({
        ephemeral: true,
        content: '설정하실 알림을 선택해주세요.',
        embeds: [
            {
                title: '혹시... 설정이 어려우신가요?',
                description: `
방송알리미는 여러분의 방송을 조금 더 간편하게 등록 가능하도록
"알림 신규" 기능을 추가로 제공하고 있습니다.

\`/알림 신규 링크:url\` 명령어를 통해 플랫폼 알림을 등록 할 수 있습니다.

- 치지직: https://chzzk.naver.com/...
- 아프리카: https://[bj,play,www].afreecatv.com/...
- 유튜브: https://www.youtube.com/@채널명
                `,
                image: {
                    url: 'https://cdn.orefinger.click/upload/466950273928134666/b70160c5-036d-4c8a-8336-403dabf88ef1.png',
                },
                color: 0x00ff00,
            },
        ],
        components: await createComponentSelectMenuByComponentPagingMenuByKey(
            {
                custom_id: 'notice list',
                placeholder: '설정하실 알림을 선택해주세요.',
            },
            QUERY.SelectNoticeDashbord
        ),
    });
};

const api = createChatinputCommand(
    {
        description: '소셜 알림을 설정합니다.',
    },
    __filename
);
export default api;
