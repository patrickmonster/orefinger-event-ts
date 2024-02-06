import { MessageMenuInteraction } from 'interactions/message';

import { getChzzkUser } from 'components/chzzkUser';
import { editerComponent } from 'components/systemComponent';
import { selectNoticeDtilByEmbed } from 'controllers/notice';
import { createChannelSelectMenu } from 'utils/discord/component';
/**
 *
 * 가이드 호출 - 디비처리용
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, noticeType: string) => {
    const {
        message: { components },
        values: [hashId],
        guild_id,
    } = interaction;

    if (!guild_id) return;
    switch (noticeType) {
        case '4': {
            const noticeId = await getChzzkUser(hashId);
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

            break;
        }
    }
};
