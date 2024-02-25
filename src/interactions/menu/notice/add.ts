import { MessageMenuInteraction } from 'interactions/message';

import { getChzzkUser } from 'components/chzzkUser';
import { getNoticeDetailByEmbed } from 'components/notice';
import { getYoutubeUser } from 'components/youtubeUser';
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
            case '2': {
                // 유튜브
                noticeId = await getYoutubeUser(hashId);
                break;
            }
            case '4': {
                // 치지직
                noticeId = await getChzzkUser(hashId);
                break;
            }
            case '5': {
                // 아프리카
                noticeId = await getChzzkUser(hashId);
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
        const { embed, components } = await getNoticeDetailByEmbed(noticeId, guild_id);

        interaction.reply({
            embeds: [embed],
            ephemeral: true,
            components,
        });
    } else {
        interaction.reply({
            content: '사용자를 찾을 수 없습니다.',
        });
    }
};
