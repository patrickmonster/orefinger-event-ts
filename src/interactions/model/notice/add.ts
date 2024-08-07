import { getNoticeDetailByEmbed } from 'components/notice';
import { searchAfreecabeUser } from 'components/user/afreeca';
import { getChzzkUser, isChzzkHash, searchChzzkUser } from 'components/user/chzzk';
import { searchYoutubeUser } from 'components/user/youtube';
import { MessageMenuInteraction } from 'interactions/message';
import {
    createActionRow,
    createDangerButton,
    createStringSelectMenu,
    createSuccessButton,
} from 'utils/discord/component';

/**
 * 사용자를 검색합니다
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, values: Record<string, string>, noticeType: string) => {
    const { guild_id } = interaction;
    const { value: keyword } = values;

    if (!guild_id) return;

    let list: Array<{ name: string; value: string }> = [];
    switch (noticeType) {
        case '2': {
            list = await searchYoutubeUser(keyword);
            break;
        }
        case '4': {
            // 직접 탐색
            if (isChzzkHash(keyword)) {
                const { embeds, components } = await getNoticeDetailByEmbed(
                    await getChzzkUser(guild_id, keyword),
                    guild_id
                );
                return interaction.reply({
                    embeds,
                    ephemeral: true,
                    components,
                });
            } else list = await searchChzzkUser(keyword);
            break;
        }
        case '5': {
            list = await searchAfreecabeUser(keyword);
            break;
        }
        // '8' - 인증알림은 검색 대상이 아님.
        default:
            interaction.reply({
                components: [
                    createActionRow(
                        createDangerButton(`not found`, {
                            emoji: { name: '❗' },
                            label: `해당하는 알림은 사용할 수 없습니다.`,
                            disabled: true,
                        })
                    ),
                ],
            });
    }

    interaction.reply({
        content: '검색결과',
        ephemeral: true,
        components: list.length
            ? [
                  createStringSelectMenu(`notice add ${noticeType}`, {
                      placeholder: '원하시는 사용자를 선택해주세요.',
                      options: list.map(({ name, value }) => ({ label: name, value })),
                      max_values: 1,
                      min_values: 1,
                  }),
                  createActionRow(
                      createSuccessButton(`notice add ${noticeType} 1`, {
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
                      createSuccessButton(`notice add ${noticeType} 1`, {
                          emoji: { name: '🔍' },
                          label: `재검색`,
                      })
                  ),
              ],
    });
};
