import { deleteNoticeChannel } from 'controllers/notice';
import { ChannelType as ChannelMessageType, NoticeChannelHook, OriginMessage } from 'interfaces/notice';
import { openApi } from 'utils/discordApiInstance';
import { messageCreate, postDiscordMessage } from '../discord';

const ERROR = (...e: any) => {
    console.error(__filename, ' Error: ', ...e);
};

/**
 * 각 채널 별로 메세지를 전송합니다
 * @param channels
 * @param message
 */
export const sendMessageByChannels = async (channels: NoticeChannelHook[], isTest = false) => {
    const messages: OriginMessage[] = [];
    for (const { channel_id, url, notice_id, message, channel_type } of channels) {
        let originMessage;
        let targetUrl = url;
        console.log('sendMessageByChannels', channel_type);

        switch (channel_type) {
            case ChannelMessageType.TEXT: {
                originMessage = await messageCreate(channel_id, message).catch(e => {
                    if ([10003, 50001 /* , 50013 */].includes(e.code)) {
                        deleteNoticeChannel(notice_id, channel_id).catch(e => {
                            ERROR('DeleteChannel', e);
                        });
                    } else ERROR(e);
                });
                break;
            }
            case ChannelMessageType.WEBHOOK:
                // 훅 발송
                originMessage = await postDiscordMessage(`/${url}`, message).catch(e => {
                    ERROR(e);
                    if ([10003, 50001].includes(e.code)) {
                        deleteNoticeChannel(notice_id, channel_id).catch(e => {
                            ERROR('DeleteChannel', e);
                        });
                    }
                });
                break;
        }

        if (originMessage && originMessage?.id) {
            messages.push({
                url: `${targetUrl || ''}`,
                message: originMessage,
                id: originMessage.id,
                channel_type,
            });
        }
    }

    if (!isTest && messages[0]) {
        const { embeds } = messages[0].message;
        openApi.post(`${process.env.WEB_HOOK_URL}`, {
            content: `${channels[0].notice_id}]${channels.length}개 채널에 알림이 전송되었습니다.`,
            embeds: embeds,
        });
    }

    return messages;
};
