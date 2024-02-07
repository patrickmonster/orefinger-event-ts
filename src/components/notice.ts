import { NoticeId, selectNoticeDtilByEmbed } from 'controllers/notice';
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
