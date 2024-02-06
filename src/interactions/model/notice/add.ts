import { getChzzkUser, searchChzzkUser } from 'components/chzzkUser';
import { editerComponent } from 'components/systemComponent';
import { searchYoutubeUser } from 'components/youtubeUser';
import { selectNoticeDtilByEmbed } from 'controllers/notice';
import { APIActionRowComponent, APIMessageActionRowComponent } from 'discord-api-types/v10';
import { MessageMenuInteraction } from 'interactions/message';
import {
    createActionRow,
    createChannelSelectMenu,
    createDangerButton,
    createStringSelectMenu,
    createSuccessButton,
} from 'utils/discord/component';
import { getChzzkAPI } from 'utils/naverApiInstance';

const chzzk = getChzzkAPI('v1');

const hashIdChzzk = new RegExp('^[a-zA-Z0-9]{32}$');

const searchUser = async (
    keyword: string,
    noticeType: string
): Promise<APIActionRowComponent<APIMessageActionRowComponent>[]> => {
    let list: Array<{ name: string; value: string }> = [];
    switch (noticeType) {
        case '4': {
            list = await searchChzzkUser(keyword);
            break;
        }
        case '2': {
            list = await searchYoutubeUser(keyword);
            break;
        }
        default:
            return [
                createActionRow(
                    createDangerButton(`not found`, {
                        emoji: { name: '❗' },
                        label: `해당하는 알림은 사용할 수 없습니다.`,
                        disabled: true,
                    })
                ),
            ];
    }

    if (!list.length) {
        return [
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
        ];
    }

    return [
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
    ];
};
/**
 * 사용자를 검색합니다
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, values: Record<string, string>, noticeType: string) => {
    const { value } = values;
    const { guild_id, channel } = interaction;
    if (!guild_id) return;

    switch (noticeType) {
        case '4': {
            // 치지직 추가
            if (hashIdChzzk.test(value)) {
                const noticeId = await getChzzkUser(value);
                if (noticeId) {
                    const { embed, channels } = await selectNoticeDtilByEmbed(noticeId, guild_id);

                    console.log('channels', channels, embed);

                    interaction.reply({
                        embeds: [embed],
                        ephemeral: true,
                        components: [
                            createChannelSelectMenu(`notice channel ${noticeId}`, {
                                placeholder: '알림을 받을 채널을 선택해주세요.',
                                default_values: channels,
                                max_values: 25,
                                min_values: 1,
                            }),
                            editerComponent(`notice channel ${noticeId}`, [], true),
                        ],
                    });
                } else {
                    interaction.reply({
                        content: '치지직 사용자를 찾을 수 없습니다.',
                    });
                }
            } else {
                interaction.reply({
                    content: '검색결과',
                    ephemeral: true,
                    components: await searchUser(value, noticeType),
                });
            }
            break;
        }
        default:
            interaction.reply({
                content: '검색결과',
                ephemeral: true,
                components: await searchUser(value, noticeType),
            });
            break;
    }
};
