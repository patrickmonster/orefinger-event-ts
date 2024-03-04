import { NoticeId, ParseInt, selectNoticeDtilByEmbed, upsertNotice } from 'controllers/notice';
import { ChannelType } from 'discord-api-types/v10';
import { createChannelSelectMenu } from 'utils/discord/component';
import { editerComponent } from './systemComponent';

export const getNoticeDetailByEmbed = async (noticeId: NoticeId, guildId: string) => {
    const { embed, channels } = await selectNoticeDtilByEmbed(noticeId, guildId);
    return {
        embed,
        components: [
            createChannelSelectMenu(`notice channel ${noticeId}`, {
                placeholder: '알림을 받을 채널을 선택해주세요.',
                channel_types: [ChannelType.GuildText],
                default_values: channels,
                max_values: 1,
                min_values: 0,
            }),
            editerComponent(`notice channel ${noticeId}`, [], true),
        ],
    };
};

/**
 * 알림타입 (시스템 내부 알림인 경우)
 * @param guildId
 * @param noticeType
 */
export const getNoticeByType = async (guildId: string, noticeType: string | number) => {
    try {
        const hashId = `${guildId || 0}_${noticeType}`;
        const noticeId = await upsertNotice(
            {
                hash_id: hashId,
                notice_type: ParseInt(noticeType),
                message: '|| {user} || New user! 📌',
                name: '인증알리미',
            },
            true
        );

        return noticeId;
    } catch (e) {
        console.log(`${noticeType} 생성에 실패하였습니다.`, e);

        return 0;
    }
};
