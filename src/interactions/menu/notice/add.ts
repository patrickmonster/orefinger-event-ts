import { MessageMenuInteraction } from 'interactions/message';

import { checkUserNoticeLimit, getNoticeByType, getNoticeDetailByEmbed } from 'components/notice';
import { getAfreecabeUser } from 'components/user/afreeca';
import { getChzzkUser } from 'components/user/chzzk';
import { getChannelVideos as getLaftel, getLaftelVod } from 'components/user/laftel';
import { getChannelVideos as getYoutube, getYoutubeUser } from 'components/user/youtube';
/**
 *
 * 가이드 호출 - 디비처리용
 * @param interaction
 */
export const exec = async (interaction: MessageMenuInteraction, noticeType: string) => {
    const {
        values: [hashId],
        guild_id,
        user,
        member,
    } = interaction;

    if (!guild_id) return;
    await interaction.differ({ ephemeral: true });

    let noticeId: number | undefined;
    const userId = user?.id || member?.user.id;

    if (!(await checkUserNoticeLimit(interaction, `${userId}`, guild_id))) {
        return;
    }

    try {
        switch (noticeType) {
            case '2': {
                // 유튜브
                noticeId = await getYoutubeUser(guild_id, hashId);
                getYoutube(noticeId, hashId).catch(e => {}); // 채널 비디오 조회 (버림)
                break;
            }
            case '3': {
                // 인증 알림
                noticeId = await getNoticeByType(guild_id || '0', `${noticeType}_${hashId}`, {
                    message: `{user}\n New user! 📌`,
                    name: '인증알리미',
                });
                break;
            }
            case '4': {
                // 치지직
                noticeId = await getChzzkUser(guild_id, hashId);
                break;
            }
            case '5': {
                // 아프리카
                noticeId = await getAfreecabeUser(guild_id, hashId);
                break;
            }
            case '7': {
                // 라프텔
                noticeId = await getLaftelVod(guild_id, hashId);
                getLaftel(noticeId, hashId).catch(e => {}); // 채널 비디오 조회 (버림)
                break;
            }
            // 8 인증알림은 바로 리스트 출력
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
        const { embeds, components } = await getNoticeDetailByEmbed(noticeId, guild_id);

        interaction.reply({
            embeds,
            ephemeral: true,
            components,
        });
    } else {
        interaction.reply({
            content: '사용자를 찾을 수 없습니다.',
        });
    }
};
