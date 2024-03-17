import { NoticeId, ParseInt, selectNoticeDtilByEmbed, upsertAttach, upsertNotice } from 'controllers/notice';
import { ChannelType } from 'discord-api-types/v10';
import { NoticeChannel } from 'interfaces/notice';
import { createChannelSelectMenu } from 'utils/discord/component';
import { editerComponent } from './systemComponent';

import { selectEventBat } from 'controllers/bat';
import { deleteNoticeChannel } from 'controllers/notice';
import { getAttendanceAtLive } from 'controllers/notification';
import { RESTPostAPIChannelMessage } from 'plugins/discord';
import createCalender from 'utils/createCalender';
import discord, { openApi } from 'utils/discordApiInstance';
import { convertMessage } from 'utils/object';
import { catchRedis } from 'utils/redis';
import { getUser } from './discord';

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
export const sendChannels = async (channels: NoticeChannel[], message: RESTPostAPIChannelMessage) => {
    for (const { notice_id, channel_id } of channels) {
        console.log('sendChannels', notice_id, channel_id);
        discord.post(`/channels/${channel_id}/messages`, { body: message }).catch(e => {
            ERROR(e);
            deleteNoticeChannel(notice_id, channel_id).catch(e => {
                ERROR('DeleteChannel', e);
            });
        });
    }

    if (message.embeds?.length)
        openApi.post(`${process.env.WEB_HOOK_URL}`, {
            embeds: message.embeds,
        });
};

/**
 * 시스템 내부 알림 발생시, 알림을 전송합니다
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

export const selectAttachList = async (noticeId: string | number) =>
    await catchRedis(
        `notice:attach:${noticeId}`,
        async () => {
            const list = await getAttendanceAtLive(noticeId);
            for (const attach of list) {
                if (attach.name == null) {
                    const { username } = await getUser(attach.auth_id);
                    attach.name = username;
                }
            }
            return list;
        },
        60 * 10
    );
/**
 * 라이브 모듈에서 출석 체크를 시도함
 *  - 출석 정보를 저장하고, 캘린터를제작하여 뿌려줌
 * @param noticeId
 * @param userId
 * @returns
 */
export const selectAttachMessage = async (
    noticeId: string | number,
    userId: string
): Promise<RESTPostAPIChannelMessage> => {
    const { isSuccess, list } = await upsertAttach(noticeId, userId);

    let count = 0;

    // 개근일자
    for (const { attendance_time } of list) {
        if (attendance_time) count++;
        else break;
    }

    const pin = list
        .filter(({ attendance_time }) => attendance_time)
        .map(({ attendance_time }) => new Date(attendance_time)); // 출석회수
    const spin = list.map(({ create_at }) => new Date(create_at)); // 방송횟수
    return {
        content: isSuccess ? '출석체크가 완료되었습니다!' : '이미 출석이 완료되었습니다!',
        ephemeral: true,
        embeds: [
            {
                color: 0xffca52,
                author: {
                    name: '방송알리미',
                    icon_url:
                        'https://cdn.orefinger.click/post/466950273928134666/e4a1e3e4-ffe1-45c1-a0f6-0107301babcc.png',
                    url: 'https://toss.me/방송알리미',
                },
                provider: {
                    name: 'Create by.뚱이(Patrickmonster)',
                    url: 'https://toss.me/방송알리미',
                },
                description: `
출석율 : ${((pin.length / spin.length) * 100).toFixed(2)}% (${pin.length}/${spin.length})
출석 : ${count - 1 > 0 ? count + '회 연속' : '연속된 데이터가 없네요 8ㅅ8'}

### 출석은 방송 알림이 오면 출석을 눌러주세요!
 - 방송정보를 통하여 출석을 체크합니다.
===========================
\`\`\`ansi
${createCalender(new Date(), ...pin)}
\`\`\``,
            },
        ],
    };
};
