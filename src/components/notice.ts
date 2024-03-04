import { NoticeId, ParseInt, selectNoticeDtilByEmbed, upsertNotice } from 'controllers/notice';
import { ChannelType } from 'discord-api-types/v10';
import { NoticeChannel } from 'interfaces/notice';
import { createChannelSelectMenu } from 'utils/discord/component';
import { editerComponent } from './systemComponent';

import { selectEventBat } from 'controllers/bat';
import { deleteNoticeChannel } from 'controllers/notice';
import discord from 'utils/discordApiInstance';
import { convertMessage } from 'utils/object';

const ERROR = (...e: any) => {
    console.error(__filename, ' Error: ', ...e);
};
const getNoticeHashId = (guildId: string, noticeType: string | number) => `${guildId || 0}_${noticeType}`;

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
export const getNoticeByType = async (
    guildId: string,
    noticeType: string | number,
    options: {
        message: string;
        name: string;
    }
) => {
    try {
        const hashId = getNoticeHashId(guildId, noticeType);
        const noticeId = await upsertNotice(
            {
                hash_id: hashId,
                notice_type: ParseInt(noticeType),
                message: options.message,
                name: options.name,
            },
            true
        );

        return noticeId;
    } catch (e) {
        console.log(`${noticeType} 생성에 실패하였습니다.`, e);

        return 0;
    }
};

/**
 * 각 채널 별로 메세지를 전송합니다
 * @param channels
 * @param message TODO : message 객체
 */
export const sendChannels = async (channels: NoticeChannel[], message: any) => {
    for (const { notice_id, channel_id } of channels) {
        console.log('sendChannels', notice_id, channel_id);
        discord.post(`/channels/${channel_id}/messages`, { body: message }).catch(e => {
            ERROR(e);
            deleteNoticeChannel(notice_id, channel_id).catch(e => {
                ERROR('DeleteChannel', e);
            });
        });
    }
};
/**
 * 인증 발생시, 알림을 전송합니다
 * @param guildId
 * @param noticeType
 */
export const sendNoticeByBord = async (
    guildId: string,
    noticeType: string | number,
    message?: { [key: string]: string }
) => {
    const hashId = getNoticeHashId(guildId, noticeType);
    const data = await selectEventBat(hashId);

    if (!data || !data.hash_id || !data.channels?.length) return;
    const messageData = {
        content: data.message,
    };

    await sendChannels(data.channels, message ? convertMessage(messageData, message) : message);
};
