import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import redis from 'utils/redis';

import { Event, EventSub, Subscription } from 'interfaces/eventsub';

import {
    event as createEvent,
    grant,
    register,
    stateChangeEventChannel,
    streamOffline,
    streamOnline,
} from 'controllers/twitch';

import discord, { openApi } from 'utils/discordApiInstance';

import { usersUpdate } from 'components/twitch';
import irc from 'utils/twitchIrc';

const randomIntegerInRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * 방송알림 컴포넌트
 * @param user_id
 * @param game_id
 * @returns
 */
const getComponentsAttach = (user_id: string, game_id: string) => [
    {
        type: 1,
        components: [
            {
                custom_id: `event attendance ${user_id} ${game_id || 0}`,
                emoji: { name: '📆' },
                label: '출석체크',
                style: 3,
                type: 2,
            },
        ],
    },
];

export default async (fastify: FastifyInstance, opts: any) => {
    const event = (event: Event, subscription: Subscription) => {
        switch (subscription.type) {
            case 'channel.follow':
                break;
            case 'channel.subscribe':
                break;
            case 'channel.update':
                // 내부적으로 처리함
                break;
            case 'user.update':
                usersUpdate(`${event.user_id}`).catch(e => {});
                break;
            case 'user.authorization.grant':
                {
                    const { user_id, user_name, user_login } = event;
                    openApi.post(
                        `webhooks/866328237852590150/7_30tTWROLWpdlLyxxw1NugGyCrbRZzhti4AmKNhLPWnpcbRDy6G0gOpDPP-DZBskZDg`,
                        {
                            avatar_url:
                                'https://media.discordapp.net/attachments/682449668428529743/952426021179756544/KakaoTalk_20220311_213330580_01.png',
                            username: '가입알리미',
                            content: `${user_name}(${user_login})\nhttp://twitch.tv/${user_login}`,
                        }
                    );
                    grant(`${user_id}`).then(channels => {
                        for (const { channel_id, login, name } of channels) {
                            openApi
                                .post(`channels/${channel_id}/messages`, {
                                    content: `✅ 로그인 성공 - ${name}(${login})`,
                                })
                                .catch(e => {});
                        }
                    });
                }
                break;
            case 'stream.online':
                {
                    const { broadcaster_user_login, broadcaster_user_name, broadcaster_user_id, type } = event;
                    if (type !== 'live') return;
                    console.log(`온라인 - ${broadcaster_user_name}(${broadcaster_user_login})`);

                    streamOnline(event, 14).then(channels => {
                        if (channels.length === 0) return; // 이벤트가 없거나, 이미 진행된 이벤트
                        irc.say(
                            `${broadcaster_user_login}`,
                            '안뇽! 아숩지만, 이제 여길 떠나야 할 시간이야... orefinger.notion.site/b89c8c193e4142b2b16c6b9432fa54e4 daromLcat'
                        ).catch(e => {});
                        for (const {
                            id,
                            /* kr_name ,*/ channel_id,
                            custom_ment,
                            url,
                            title,
                            game_id,
                            game_name,
                        } of channels) {
                            // 웹훅인경우, 처리
                            (url.startsWith('webhooks/') ? openApi : discord)
                                .post(`/${url}`, {
                                    username: broadcaster_user_name,
                                    content: custom_ment,
                                    embeds: [
                                        {
                                            title,
                                            // color,
                                            url: `https://twitch.tv/${broadcaster_user_login}`,
                                            image: {
                                                url: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${broadcaster_user_login}-1920x1080.jpg?randCode=${randomIntegerInRange(
                                                    0,
                                                    10000
                                                )}`,
                                            },
                                            fields: [
                                                { name: 'Game', value: `${game_name || 'LIVE'}`, inline: true },
                                                {
                                                    name: 'Stream',
                                                    value: `https://twitch.tv/${broadcaster_user_login}`,
                                                },
                                            ],
                                        },
                                    ],
                                    components: getComponentsAttach(id, game_id),
                                })
                                .catch(e => {
                                    // 채널을 찾을 수 없음
                                    console.log(
                                        '프로세서 [ONLINE] 알림 채널 메세지 전송 실패',
                                        `${broadcaster_user_name} - ${broadcaster_user_login}(${broadcaster_user_id})`
                                    );
                                    stateChangeEventChannel(channel_id, { delete_yn: 'Y' }).catch(e => {});
                                });
                        }
                    });
                }
                break;
            case 'stream.offline':
                {
                    const { broadcaster_user_id, broadcaster_user_login, broadcaster_user_name } = event;
                    streamOffline(`${broadcaster_user_id}`, 14)
                        .then(e => {
                            const [{ event_id }] = e;
                            if (event_id == null) {
                                console.log(`오프라인 - ${broadcaster_user_name}(${broadcaster_user_login})`);
                            }
                        })
                        .catch(e => {});
                }
                break;
        }
    };

    const eventSub = (
        req: FastifyRequest<{
            Body: EventSub;
        }>,
        res: FastifyReply
    ) => {
        const { body, headers } = req;
        if (fastify.verifyTwitchEventSub(req, res)) {
            const msg_id = `${headers['twitch-eventsub-message-id']}`;
            const msg_type = `${headers['twitch-eventsub-message-type']}`;

            if (msg_type == 'webhook_callback_verification') {
                // 새로운 이벤트 등록
                register(body.subscription);
                return res.code(200).send(encodeURIComponent(`${body.challenge}`));
            }
            res.code(200).send('OK');

            let isExist = false;
            redis
                .get(`event:${msg_id}`)
                .then(message => (isExist = !!message))
                .catch(e => {}) // ignore
                .finally(() => {
                    if (isExist) return;
                    redis
                        .set(`event:${msg_id}`, JSON.stringify(body.event), {
                            EX: 60 * 60 * 6,
                        })
                        .catch(e => {});

                    switch (msg_type) {
                        case 'notification':
                            console.log(
                                'notification received]',
                                JSON.stringify({ type: body.subscription.type, event: body.event })
                            );
                            if (body.event) {
                                createEvent(body.event, body.subscription);
                                event(body.event, body.subscription);
                            }
                            break;
                        case 'revocation':
                            console.log(
                                'notification revoked]',
                                JSON.stringify({ type: body.subscription.type, id: body.subscription.id })
                            );
                            break;
                        default:
                            break;
                    }
                });
        }
    };

    fastify.post('/twitch/event', { schema: { hide: true } }, eventSub);
    fastify.post('/event/twitch', { schema: { hide: true } }, eventSub);
};
