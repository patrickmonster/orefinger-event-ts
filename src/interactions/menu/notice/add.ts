import { MessageMenuInteraction } from 'interactions/message';

import { getChzzkUser } from 'components/chzzkUser';
import { editerComponent } from 'components/systemComponent';
import { getYoutubeUser } from 'components/youtubeUser';
import { selectNoticeDtilByEmbed } from 'controllers/notice';
import { createChannelSelectMenu } from 'utils/discord/component';
/**
 *
 * 가이드 호출 - 디비처리용
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, noticeType: string) => {
    const {
        values: [hashId],
        guild_id,
    } = interaction;

    if (!guild_id) return;

    let noticeId: number | undefined;

    console.log('noticeType', noticeType, hashId);

    try {
        switch (noticeType) {
            case '4': {
                // 치지직
                noticeId = await getChzzkUser(hashId);
                break;
            }
            case '2': {
                // 유튜브
                noticeId = await getYoutubeUser(hashId);
                break;
            }
            default: {
                interaction.reply({
                    content: '알림 타입을 찾을 수 없습니다.',
                    ephemeral: true,
                });
                return;
            }
        }
    } catch (e) {
        interaction.reply({
            content: '사용자를 찾을 수 없습니다.',
            ephemeral: true,
        });
    }

    if (noticeId) {
        const { embed, channels } = await selectNoticeDtilByEmbed(noticeId, guild_id);

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
            content: '사용자를 찾을 수 없습니다.',
        });
    }
};
