import axios from 'axios';
import { webhookCreate } from 'components/discord';
import { convertVideoObject as convertAfreecaVideoObject, getLive as getAfreecaLive } from 'components/user/afreeca';
import { convertVideoObject, getLive as getChzzkLive } from 'components/user/chzzk';
import { FastifyInstance } from 'fastify';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.post<{
        Params: { channel: string };
        Querystring: { name: string };
    }>(
        '/webhook/:channel',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Bearer: [] }],
                description: '훅을 생성합니다.',
                summary: '훅 생성',
                tags: ['Notice'],
                deprecated: false,
                querystring: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: { type: 'string', description: '훅 이름' },
                    },
                },
            },
        },
        async req => webhookCreate(req.params.channel, { name: req.query.name, auth_id: req.user.id }, 'Y')
    );

    fastify.post<{
        Params: { channel: string; hash_id: string };
    }>(
        '/webhook/:channel/chzzk/:hash_id',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '치지직 훅을 생성합니다.',
                summary: '치지직 훅 생성',
                tags: ['Admin'],
                deprecated: false,
                params: {
                    type: 'object',
                    required: ['channel', 'hash_id'],
                    properties: {
                        channel: { type: 'string', description: '채널 ID' },
                        hash_id: { type: 'string', description: '치지직Id' },
                    },
                },
            },
        },
        async req =>
            getChzzkLive(req.params.hash_id).then(async content => {
                if ('livePlaybackJson' in content) delete content.livePlaybackJson;
                const { channelName, channelImageUrl } = content.channel;

                return await webhookCreate(
                    req.params.channel,
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
안녕~ 반가워~!

어머나! 여기에 방송알리미 관리자가 왔다갔나봐요...!
이제부터, 방송 프로필을 통해서 알림을 받을 수 있어요!

(이거완전 러키알림잔앙 ( •̀ ω •́ )✧)
                            `,
                            embeds: [convertVideoObject(content, channelName)],
                        });
                    }

                    return webhook;
                });
            })
    );

    fastify.post<{
        Params: { channel: string; hash_id: string };
    }>(
        '/webhook/:channel/afreeca/:hash_id',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '아프리카 훅을 생성합니다.',
                summary: '아프리카 훅 생성',
                tags: ['Admin'],
                deprecated: false,
                params: {
                    type: 'object',
                    required: ['channel', 'hash_id'],
                    properties: {
                        channel: { type: 'string', description: '채널 ID' },
                        hash_id: { type: 'string', description: '치지직Id' },
                    },
                },
            },
        },
        async req =>
            getAfreecaLive(req.params.hash_id).then(async content => {
                return await webhookCreate(
                    req.params.channel,
                    { name: content.station.user_nick, auth_id: process.env.DISCORD_CLIENT_ID || '826484552029175808' },
                    'Y'
                ).then(webhook => {
                    const { url } = webhook;

                    if (url) {
                        axios.post(url, {
                            username: content.station.user_nick || '방송알리미',
                            avatar_url:
                                content.profile_image ||
                                'https://cdn.orefinger.click/post/466950273928134666/d2d0cc31-a00e-414a-aee9-60b2227ce42c.png',
                            content: `
안녕~ 반가워~!

어머나! 여기에 방송알리미 관리자가 왔다갔나봐요...!
이제부터, 방송 프로필을 통해서 알림을 받을 수 있어요!

(이거완전 러키알림잔앙 ( •̀ ω •́ )✧)
                            `,
                            embeds: [convertAfreecaVideoObject(content, content.station.user_nick)],
                        });
                    }

                    return webhook;
                });
            })
    );
};
