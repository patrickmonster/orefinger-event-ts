import { checkUserNoticeLimit, getNoticeDetailByEmbed } from 'components/notice';
import { getUrlByNoticeId, StreamTarget } from 'components/user/notice';
import { searchYoutubeUser } from 'components/user/youtube';
import { deleteOrInsertNoticeChannels } from 'controllers/notice';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import { AppChatInputInteraction, SelectOptionType } from 'interactions/app';

import {
    createActionRow,
    createChatinputCommand,
    createDangerButton,
    createStringSelectMenu,
    createSuccessButton,
    createUrlButton,
} from 'utils/discord/component';
import { hasNot } from 'utils/discord/permission';

// https://play.afreecatv.com/sikhye1004/null
export const exec = async (interaction: AppChatInputInteraction, selectOption: SelectOptionType) => {
    const { guild_id, channel, user, member, app_permissions } = interaction;

    if (!guild_id) return;
    const userId = user?.id || member?.user.id;

    const url = selectOption.get('링크');
    if (!url) {
        // 도움말 출력
        interaction.reply({
            content: `
# 복잡한 절차를 간소화 하기 위한 기능!
 - \`/알림 신규\` 명령어를 통해서, 알림을 손쉽게 추가 해 보세요!

# 지원하는 링크
    - 치지직: https://chzzk.naver.com/...
    - 아프리카: https://[bj,play,www].afreecatv.com/...
    - 유튜브: https://www.youtube.com/...

"알림설정" 및 채널 등록까지 한번에 처리 가능합니다.
            `,
            components: [
                createActionRow(
                    createUrlButton('https://orefinger.notion.site/', {
                        label: '방송알리미 설정 방법',
                        emoji: { name: '🔗' },
                    }),
                    createUrlButton('https://orefinger.notion.site/991afd0c556b4fce90df1146505c683a', {
                        label: '라이브 알림 설정 방법',
                        emoji: { name: '🔗' },
                    }),
                    createUrlButton('http://pf.kakao.com/_xnTkmG', {
                        label: '방송알리미 카카오톡 채널 (문의사항)',
                        emoji: { name: '🔗' },
                    })
                ),
            ],
        });
        return;
    }
    await interaction.differ({ ephemeral: true });

    if (!(await checkUserNoticeLimit(interaction, `${userId}`, guild_id))) {
        return;
    }

    const noticeId = await getUrlByNoticeId(guild_id, `${url}`);

    if (noticeId === null) {
        return interaction.reply({
            content: `
알림을 생성하지 못했습니다. - 사용자를 찾을 수 없습니다.

- 사용자가 존재하지 않거나, 채널이 비공개일 수 있습니다.
- 라이브/영상이 없는 경우 알림을 생성할 수 없습니다.
            `,
        });
    } else if (typeof noticeId === 'number') {
        // 아이디 검증에 실패함.

        await deleteOrInsertNoticeChannels(noticeId, guild_id, [channel.id], `${userId}`);

        if (hasNot(app_permissions, 805497872n) && hasNot(app_permissions, 8n)) {
            await interaction.reply({
                content: `
알림이 생성되었습니다.

현재 봇의 권한으로는 알림을 확인할 수 없습니다.
알림을 전송하려면 봇에게 다음 권한을 부여해주세요.

- \`메시지 관리\`
- \`메시지 전송\`
- \`임베드 링크 전송\`
- \`everyone/here 맨션\`
            `,
                components: [
                    createActionRow(
                        createUrlButton(`http://pf.kakao.com/_xnTkmG`, {
                            label: '방송알리미 카카오톡 채널',
                            emoji: { name: '🔗' },
                        })
                    ),
                ],
            });
        } else {
            // 알림 생성 맨트
            await interaction.reply({
                content: `
알림이 생성되었습니다.

방송알리미는 스트리머 분들과 빠른 소통을 하기 위하여
카카오톡 채널을 운영하고 있습니다!

추가 기능 및 업데이트 소식을 받으시려면,
아래 링크를 통해 카카오톡 채널에 추가해 주세요!
            `,
                components: [
                    createActionRow(
                        createUrlButton(`http://pf.kakao.com/_xnTkmG`, {
                            label: '방송알리미 카카오톡 채널',
                            emoji: { name: '🔗' },
                        }),
                        createUrlButton(`https://orefinger.notion.site/b99761efe08f4d5e9bd22b78e4e0d563`, {
                            label: '출석 체크 기능도 필요하신가요?',
                            emoji: { name: '📅' },
                        }),
                        createSuccessButton(`notice profile ${noticeId}`, {
                            label: '프로필 알림 설정',
                            emoji: { name: '😺' },
                        })
                    ),
                ],
            });
        }

        const { embeds, components } = await getNoticeDetailByEmbed(noticeId, guild_id);

        interaction.follow({
            embeds,
            ephemeral: true,
            components,
        });
    } else {
        // 유튜브 알림 같은 한번에 탐색 불가능한 알림
        const { id, type } = noticeId;
        const list = await searchYoutubeUser(id);

        interaction.reply({
            content: '검색결과',
            ephemeral: true,
            components: list.length
                ? [
                      createStringSelectMenu(`notice add 2`, {
                          placeholder: '원하시는 사용자를 선택해주세요.',
                          options: list.map(({ name, value }) => ({
                              label: name,
                              value,
                          })),
                          max_values: 1,
                          min_values: 1,
                      }),
                      createActionRow(
                          createSuccessButton(`notice add ${type === StreamTarget.YOUTUBE ? '2' : '0'} 1`, {
                              emoji: { name: '🔍' },
                              label: `재검색`,
                          })
                      ),
                  ]
                : [
                      createActionRow(
                          createDangerButton(`not found`, {
                              emoji: { name: '❗' },
                              label: `검색결과가 없습니다.`,
                              disabled: true,
                          }),
                          createSuccessButton(`notice add ${type === StreamTarget.YOUTUBE ? '2' : '0'} 1`, {
                              emoji: { name: '🔍' },
                              label: `재검색`,
                          })
                      ),
                  ],
        });
    }
};

const api = createChatinputCommand(
    {
        description: '소셜 알림을 새로 만듭니다.',
        options: [
            {
                name: '링크',
                description: '소셜 채널 주소를 입력해주세요.(비어있으면 도움말을 출력 합니다.)',
                type: ApplicationCommandOptionType.String,
            },
        ],
    },
    __filename
);
export default api;
