import {
    NoticeId,
    deleteNoticeChannel,
    selectNoticeDtilByEmbed,
    selectNoticeRegisterChannels,
    upsertAttach,
    upsertNotice,
} from 'controllers/notice';
import { ChannelType as ChannelMessageType, NoticeChannel, NoticeChannelHook, OriginMessage } from 'interfaces/notice';
import {
    appendTextWing,
    createActionRow,
    createChannelSelectMenu,
    createEmbed,
    createSecondaryButton,
    createUrlButton,
} from 'utils/discord/component';
import { editerComponent } from './systemComponent';

import { APIMessage, ChannelType } from 'discord-api-types/v10';

import { upsertDiscordUserAndJWTToken } from 'controllers/auth';
import { selectEventBat, selectNoticeGuildChannel } from 'controllers/bat';
import { getAttendanceAtLive } from 'controllers/notification';
import { IReply, RESTPostAPIChannelMessage } from 'plugins/discord';
import createCalender from 'utils/createCalender';
import discord, { openApi } from 'utils/discordApiInstance';
import { ParseInt, convertMessage } from 'utils/object';
import { catchRedis } from 'utils/redis';
import { getGuild, getUser, messageCreate, postDiscordMessage } from './discord';

const ERROR = (...e: any) => {
    console.error(__filename, ' Error: ', ...e);
};
const getNoticeHashId = (guildId: string, noticeType: string | number) => `${guildId || 0}_${noticeType}`;

export const getNoticeDetailByEmbed = async (noticeId: NoticeId, guildId: string) => {
    const { embed, channels } = await selectNoticeDtilByEmbed(noticeId, guildId);
    return {
        embeds: [embed],
        components: [
            createChannelSelectMenu(`notice channel ${noticeId}`, {
                placeholder: '알림을 받을 채널을 선택해주세요.',
                channel_types: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
                default_values: channels,
                max_values: 1,
                min_values: 0,
            }),
            editerComponent(
                `notice channel ${noticeId}`,
                [
                    createSecondaryButton(`notice channel ${noticeId} test`, {
                        label: '알림전송테스트',
                        emoji: {
                            name: '🔔',
                        },
                    }),
                    // createSecondaryButton(`notice channel ${noticeId} hook`, {
                    //     label: '알림프로필생성 * 유료상품',
                    //     emoji: {
                    //         name: '👀',
                    //     },
                    // }),
                ],
                true,
                {
                    copy: '알림 맨트 복사',
                    edit: '알림 맨트 수정',
                }
            ),
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
 * @param message
 */
export const sendChannels = async (channels: NoticeChannel[], message: RESTPostAPIChannelMessage) => {
    const messages: APIMessage[] = [];
    for (const { channel_id, avatar_url, url, username, notice_id } of channels) {
        if (url) {
            // 훅 발송
            const [embed] = message.embeds || [];

            const originMessage = (await discord
                .post(`/${url}`, {
                    body: {
                        ...message,
                        username: username || (embed.author?.name ?? '방송알리미'),
                        avatar_url:
                            avatar_url ||
                            (embed.author?.icon_url ??
                                'https://cdn.orefinger.click/post/466950273928134666/d2d0cc31-a00e-414a-aee9-60b2227ce42c.png'),
                    },
                })
                .catch(e => {
                    ERROR(e);
                    // if ([50013, 10003].includes(e.code)) {
                    //     deleteNoticeChannel(notice_id, channel_id).catch(e => {
                    //         ERROR('DeleteChannel', e);
                    //     });
                    // }
                })) as APIMessage;

            const id = originMessage?.id;

            if (id) {
                messages.push(originMessage);
            }
        } else {
            const originMessage = await messageCreate(channel_id, message).catch(e => {
                // if ([10003 /* , 50013 */].includes(e.code)) {
                //     deleteNoticeChannel(notice_id, channel_id).catch(e => {
                //         ERROR('DeleteChannel', e);
                //     });
                // } else
                ERROR(e);
            });

            const id = originMessage?.id;

            if (id) {
                messages.push(originMessage);
            }
        }
    }

    if (message.embeds?.length)
        openApi.post(`${process.env.WEB_HOOK_URL}`, {
            embeds: message.embeds,
        });

    return messages;
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
            case ChannelMessageType.TEXT:
                originMessage = await messageCreate(channel_id, message).catch(e => {
                    if ([10003, 50001 /* , 50013 */].includes(e.code)) {
                        deleteNoticeChannel(notice_id, channel_id).catch(e => {
                            ERROR('DeleteChannel', e);
                        });
                    } else ERROR(e);
                });
                break;
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

import { convertVideoObject as convertAfreecaVideoObject, getLive as getAfreecaLive } from 'components/user/afreeca';
import { convertVideoObject as convertChzzkVideoObject, getLive as getChzzkLive } from 'components/user/chzzk';

/**
 * 테스트 메세지를 전송합니다
 * @param noticeId
 * @param guildId
 * @returns
 */
export const sendTestNotice = async (noticeId: string | number, guildId: string) => {
    const [channel] = await selectNoticeGuildChannel(noticeId, guildId);

    if (!channel)
        return {
            content: '알림이 존재하지 않습니다.',
            ephemeral: true,
        };

    let content: any = {};
    let embed: any = {};

    const { hash_id, notice_type, name } = channel;

    switch (notice_type) {
        case 2: // 유튜브
            // 지원안함
            throw new Error('지원하지 않음');
        case 4: // 치지직
            content = await getChzzkLive(hash_id);
            embed = convertChzzkVideoObject(content, name);
            break;
        case 5: // 아프리카 티비
            content = await getAfreecaLive(hash_id);
            embed = convertAfreecaVideoObject(content, name);
            break;
    }

    await sendMessageByChannels(
        [
            {
                ...channel.channel,
                message: {
                    content: '알림 테스트 입니다!',
                    embeds: [embed],
                    username: content.channel?.channelName || '방송알리미',
                    avatar_url:
                        content.channel?.channelImageUrl ||
                        'https://cdn.orefinger.click/post/466950273928134666/d2d0cc31-a00e-414a-aee9-60b2227ce42c.png',
                },
            },
        ],
        true
    );
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
    let name: string | undefined = undefined;
    // 개근일자
    for (const { attendance_time, name: orgName } of list) {
        if (attendance_time) count++;
        else break;

        if (orgName) name = orgName;
    }

    if (!name) {
        // 사용자 정보를 저장함 (기반 데이터가 없는 경우)
        upsertDiscordUserAndJWTToken(await getUser(userId)).catch(e => {});
    }

    const pin = list
        .filter(({ attendance_time }) => attendance_time)
        .map(({ attendance_time }) => new Date(attendance_time)); // 출석회수
    const spin = list.map(({ create_at }) => new Date(create_at)); // 방송횟수
    return {
        content: isSuccess ? '출석체크가 완료되었습니다!' : '이미 출석이 완료되었습니다!',
        ephemeral: true,
        embeds: [
            createEmbed({
                color: 0xffca52,
                author: {
                    name: '방송알리미',
                    icon_url:
                        'https://cdn.orefinger.click/post/466950273928134666/e4a1e3e4-ffe1-45c1-a0f6-0107301babcc.png',
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
            }),
        ],
        components: [
            createActionRow(
                createUrlButton(`https://orefinger.click/bord/attach/${noticeId}`, {
                    label: appendTextWing('📅출석현황', 8),
                })
            ),
        ],
    };
};

/**
 * 알림 개수를 제한합니다
 * @param interaction
 * @param userId
 * @returns
 */
export const checkUserNoticeLimit = async (interaction: IReply, userId: string, guild_id: string): Promise<boolean> => {
    // 예외 사용자
    if (['466950273928134666'].includes(userId)) return true;
    const { approximate_member_count, region } = await getGuild(guild_id);
    const oldList = await selectNoticeRegisterChannels(`${userId}`);

    if (oldList.length >= 10) {
        interaction.reply({
            content: `
# 알림은 최대 10개까지 등록 가능합니다.
(등록을 남발하는 유저가 있어, 제한을 두게 되었습니다.)

# 등록된 알림 리스트
${oldList.map(({ channel_id, name }) => `${name} - <#${channel_id}>`).join('\n')}

* 알림을 삭제하고 싶으시다면, 문의사항을 통해서 삭제 요청을 해주세요!
* 직접 채널을 삭제 하셔도 됩니다.
 - [문의사항](http://pf.kakao.com/_xnTkmG)
            `,
        });

        return false;
    }

    if (oldList.length > 2) {
        if ((approximate_member_count || 1) < 10) {
            interaction.reply({
                content: `
현재 채널은 개인 서버로 확인이 되어, 알림 등록이 원활하게 진행되지 않습니다.

# 알림 남용등록 및 개인 서버 알림 등록 제한
"개인서버"로 지정하여 알림만을 사용하기 위하여
알림 채널을 20개 이상 등록하는 경우가 과다하여, 기존의 이용중인 스트리머 분들께도 영향이 있어
최소인원을 두어, 2인 이하 채널은 알림 등록이 제한되어 있습니다.

10명 이상이 서버내에 존재해야 등록이 가능하며,
인원이 10인 이상인 경우, 다시 시도해주세요.
- 과다 알림이 등록되어, 추후 길드 인원이 10인 이하로 확인이 된 경우, 경고없이 알림을 삭제 할 수 있습니다.

* 알림을 삭제하고 싶으시다면, 문의사항을 통해서 삭제 요청을 해주세요!
* 직접 채널을 삭제 하셔도 됩니다.
- [문의사항](http://pf.kakao.com/_xnTkmG)
- [관련문서](https://orefinger.notion.site/1ea5f6c7170f41bd9cc7671e513f28b2)
                `,
            });
            return false;
        }
    }

    if (['hongkong'].includes(region)) {
        interaction.reply({
            content: `
# 지역 차단으로 인한 알림 등록 제한
해당 서버는 차단된 지역으로, 알림 등록이 불가능합니다.

해당 지역의 무분별한 서비스 남용 및 악용으로 인하여,
국내의 스트리머 분들이 불편을 격는 경우가 있어, 
해당 지역은 알림 등록이 제한되어 있습니다.

# 由於區域封鎖而限制通知註冊
此伺服器位於封鎖區域，因此無法註冊通知。

由於該地區肆意濫用和濫用服務，
國內主播有時會遇到不便，
通知註冊在此區域受到限制。
            `,
        });
        return false;
    }

    return true;
};
