import {
    NoticeId,
    deleteNoticeChannel,
    seelctNoticeHistory,
    selectNoticeDtilByEmbed,
    selectNoticeRegisterChannels,
    upsertAttach,
    upsertNotice,
} from 'controllers/notice';
import { format } from 'date-fns';
import { ChannelType as ChannelMessageType, NoticeChannel, NoticeChannelHook, OriginMessage } from 'interfaces/notice';
import {
    appendTextWing,
    createActionRow,
    createChannelSelectMenu,
    createEmbed,
    createSecondaryButton,
    createSuccessButton,
    createUrlButton,
} from 'utils/discord/component';
import { editerComponent } from './systemComponent';

import {
    APIActionRowComponent,
    APIEmbed,
    APIMessage,
    APIMessageActionRowComponent,
    ChannelType,
} from 'discord-api-types/v10';

import { upsertDiscordUserAndJWTToken } from 'controllers/auth';
import { selectEventBat, selectNoticeGuildChannel } from 'controllers/bat';
import { getAttendanceAtLive } from 'controllers/notification';
import { IReply, RESTPostAPIChannelMessage } from 'plugins/discord';
import { sixWeek, sixWeekBig } from 'utils/createCalender';
import discord, { openApi } from 'utils/discordApiInstance';
import { ParseInt, convertMessage } from 'utils/object';
import { catchRedis } from 'utils/redis';
import { getGuild, getUser, messageCreate, postDiscordMessage, webhookCreate } from './discord';

const limit = false;

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
                    createSuccessButton(`notice profile ${noticeId}`, {
                        label: '프로필 알림 설정',
                        emoji: { name: '😺' },
                    }),
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
            guildId,
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

import axios from 'axios';
import { convertVideoObject as convertAfreecaVideoObject, getLive as getAfreecaLive } from 'components/user/afreeca';
import { convertVideoObject as convertChzzkVideoObject, getLive as getChzzkLive } from 'components/user/chzzk';
import { convertVideoObject as convertCimeVideoObject, getLive as getCimeLive } from 'components/user/cime';
import menuComponentBuild from 'utils/menuComponentBuild';
import { addPointUser, appendPointCount } from './user/point';

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
        case 16: //
            content = await getCimeLive(hash_id);
            embed = convertCimeVideoObject(content, name);
            break;
    }

    const { channel_id, url, channel_type } = channel.channel;

    const message = {
        content: '알림 테스트 입니다!',
        embeds: [embed],
        username: content.channel?.channelName || '방송알리미',
        avatar_url:
            content.channel?.channelImageUrl ||
            'https://cdn.orefinger.click/post/466950273928134666/d2d0cc31-a00e-414a-aee9-60b2227ce42c.png',
    };
    console.log('sendTestNotice', embed);

    switch (channel_type) {
        case ChannelMessageType.TEXT:
            delete message.avatar_url;
            delete message.username;
            await messageCreate(channel_id, message);
            break;
        case ChannelMessageType.WEBHOOK:
            // 훅 발송
            await postDiscordMessage(`/${url}`, message);
            break;
    }
};

export const createNoticeWebhook = async (
    chnnaelId: string,
    channelName: string,
    channelImageUrl: string,
    embed: APIEmbed
) => {
    //
    await webhookCreate(
        chnnaelId,
        { name: channelName, auth_id: process.env.DISCORD_CLIENT_ID || '826484552029175808' },
        'Y'
    ).then(webhook => {
        const { url } = webhook;

        if (url) {
            axios.post(url, {
                username: channelName || '방송알리미',
                avatar_url:
                    channelImageUrl ||
                    'https://cdn.orefinger.click/post/466950273928134666/d2d0cc31-a00e-414a-aee9-60b2227ce42c.png',
                content: `
# 프로필이 신규 등록되었습니다!
현재 채널에 전송되는 알림을 모두 이 프로필로 전송되도록 설정되었습니다!!
(이거완전 러키알림잔앙 ( •̀ ω •́ )✧)

### 주의사항
현재 알림은 "방송알리미"권한으로 설정되어 제작되었습니다.
방송알리미가 추방되거나, 권한이 변경되면 권한 오류가 발생하여, 알림 설정 자체가
중단될수 있으니 주의해주세요!
                `,
                embeds: [embed],
            });
        }

        return webhook;
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
    message?: { [key: string]: string },
    components?: APIActionRowComponent<APIMessageActionRowComponent>[]
) => {
    const hashId = getNoticeHashId(guildId, noticeType);
    const data = await selectEventBat(hashId);

    if (!data || !data.hash_id || !data.channels?.length) return;
    const messageData = {
        content: data.message,
        components,
    };

    await sendChannels(data.channels, message ? convertMessage(messageData, message) : messageData);
};

export const selectAttachList = async (noticeId: string | number, range?: number) =>
    await catchRedis(
        `notice:attach:${noticeId}:${range || 1}`,
        async () => {
            const list = await getAttendanceAtLive(noticeId, range || 1);
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
    userId: string,
    guild_id?: string
): Promise<RESTPostAPIChannelMessage> => {
    const { isSuccess, list } = await upsertAttach(noticeId, userId);

    let count = 0;
    let name: string | undefined = undefined;
    // 개근일자
    for (const { attendance_time, name: orgName } of list.reverse()) {
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
    const point = appendPointCount(100, count);

    if (isSuccess) addPointUser(userId || '', point, `출석체크 포인트 지급 ${noticeId} - ${userId} `, guild_id);

    return {
        content: isSuccess ? '출석체크가 완료되었습니다!' : '이미 출석이 완료되었습니다!',
        ephemeral: true,
        embeds: [
            createEmbed({
                color: 0xffca52,
                author: {
                    name: '방송알리미',
                    icon_url:
                        'https://cdn.orefinger.click/post/466950273928134666/d2d0cc31-a00e-414a-aee9-60b2227ce42c.png',
                    url: 'https://toss.me/방송알리미',
                },
                description: `
출석율 : ${((pin.length / spin.length) * 100).toFixed(2)}% (${pin.length}/${spin.length})
출석 : ${count - 1 > 0 ? count + '회 연속' : '연속된 데이터가 없네요 8ㅅ8'}${
                    isSuccess ? `\n +${point} 포인트를 획득하셨습니다` : ''
                }

### 출석은 방송 알림이 오면 출석을 눌러주세요!
 - 방송정보를 통하여 출석을 체크합니다.
\`\`\`ansi
${sixWeek(new Date(), ...pin)}
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

export const selectNoticeList = async (noticeId: string | number) => {
    const list = await seelctNoticeHistory(noticeId);

    // 방송 카테고리 횟수
    const games = list.reduce((acc, { game }) => {
        acc[game] = (acc[game] || 0) + 1;
        return acc;
    }, {} as any);

    return {
        ephemeral: true,
        embeds: [
            createEmbed({
                color: 0xffca52,
                author: {
                    name: '방송알리미',
                    icon_url:
                        'https://cdn.orefinger.click/post/466950273928134666/d2d0cc31-a00e-414a-aee9-60b2227ce42c.png',
                    url: 'https://toss.me/방송알리미',
                },
                description: `
최근 한달간 ${list.length}개의 방송 이력을 찾았습니다!
${
    Object.keys(games)
        .map(key => ` - ${key} 방송 ${games[key]}회`)
        .join('\n') || '방송이력이 없습니다.'
}
\`\`\`ansi
${sixWeekBig(
    {
        time: new Date(),
        textLength: 4,
    },
    ...list.map(({ live_at, game }) => ({
        time: new Date(live_at),
        title: game,
    }))
)}
\`\`\``,
            }),
        ],
        components: menuComponentBuild(
            {
                placeholder: '방송이력',
                max_values: 1,
                min_values: 1,
                custom_id: `notice logs ${noticeId}`,
            },
            ...list.reverse().map(({ live_at, id, title }) => ({
                label: `${format(new Date(live_at), 'MM.dd')}]${title}`,
                value: `${id}`,
            }))
        ),
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
    const { approximate_member_count, region, preferred_locale } = await getGuild(guild_id);

    if (/*['hongkong'].includes(region) || */ ['zh-CN', 'zh-TW'].includes(preferred_locale)) {
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

    if (!limit) return true; // 제한 없음

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

    return true;
};
