import { getChzzkUser } from 'components/chzzkUser';
import { editerComponent } from 'components/systemComponent';
import { selectNoticeDtilByEmbed } from 'controllers/notice';
import { MessageMenuInteraction } from 'interactions/message';
import { createChannelSelectMenu } from 'utils/discord/component';
import { getChzzkAPI } from 'utils/naverApiInstance';

const chzzk = getChzzkAPI('v1');

const hashIdChzzk = new RegExp('^[a-zA-Z0-9]{32}$');
/**
 * 사용자를 검색합니다
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, values: Record<string, string>, noticeType: string) => {
    const { value } = values;
    const { guild_id, channel } = interaction;
    if (!guild_id) return;

    console.log('noticeType', noticeType, value);

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
            }

            break;
        }
        default:
            break;
    }
};
