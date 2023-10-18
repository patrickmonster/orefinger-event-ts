import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { attendance } from 'controllers/twitch';
import { createSubscribe } from 'utils/token';

import { webhook, webhookUpdate } from 'controllers/online';

import { webhook as webhookUpdateType } from 'interfaces/webhook';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.addSchema({
        $id: 'twitch/onlineChannel',
        type: 'object',
        properties: {
            type: { type: 'number' },
            tag: { type: 'string' },
            user_id: { type: 'string' },
            custom_name: { type: 'string' },
            channel_id: { type: 'string' },
            guild_id: { type: 'string' },
            custom_ment: { type: 'string' },
            hook_id: { type: 'string' },
            hook_token: { type: 'string' },
            login: { type: 'string' },
            name: { type: 'string' },
            kr_name: { type: 'string' },
            avatar: { type: 'string' },
            avatar_id: { type: 'string' },
            create_at: { type: 'string' },
            update_at: { type: 'string' },
        },
    });

    const events = ['stream.online', 'stream.offline', 'channel.update'];

    fastify.put<{
        Body: { broadcaster_user_id: string; key: string };
    }>(
        '/register',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
                description: '트위치 "stream.online","stream.offline","channel.update" 이벤트들을 등록합니다.',
                tags: ['Twitch'],
                body: {
                    type: 'object',
                    required: ['broadcaster_user_id'],
                    additionalProperties: false,
                    properties: {
                        broadcaster_user_id: { type: 'string', description: '방송인 아이디' },
                        // key: { type: 'string', description: 'master key' },
                    },
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            events: { type: 'array', items: { type: 'string' } },
                        },
                    },
                    400: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                },
            },
        },
        req => {
            const { broadcaster_user_id, key } = req.body;
            const { id } = req.user;

            for (const type of events) {
                createSubscribe({ type, condition: { broadcaster_user_id } }).catch(console.error);
            }

            return { success: true, events };
        }
    );

    fastify.put<{
        Body: { broadcaster_user_id: string; key: string };
    }>(
        '/attendance',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
                description: '출석체크',
                tags: ['Twitch'],
                deprecated: false, // 비활성화
                body: {
                    type: 'object',
                    required: ['broadcaster_user_id'],
                    additionalProperties: false,
                    properties: {
                        broadcaster_user_id: { type: 'string', description: '방송인 아이디' },
                    },
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean' },
                            list: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        attendance_time: { type: 'string' },
                                        create_at: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                    400: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                },
            },
        },
        async req => {
            const { broadcaster_user_id } = req.body;
            const { id } = req.user;

            return await attendance(broadcaster_user_id, id);
        }
    );

    fastify.get(
        '/online',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
                description: '현재 등록된 방송의 알림 상태를 확인합니다.',
                tags: ['Twitch'],
                deprecated: false, // 비활성화

                response: {
                    200: {
                        type: 'array',
                        items: { $ref: 'twitch/onlineChannel#' },
                    },
                },
            },
        },
        async req => await webhook(req.user.id)
    );

    fastify.post<{
        Body: Omit<webhookUpdateType, 'user_id'>;
    }>(
        '/online',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
                description: '현재 길드 알림을 변경합니다. (없으면 생성합니다)',
                tags: ['Twitch'],
                deprecated: false, // 비활성화
                body: {
                    type: 'object',
                    required: ['guild_id', 'channel_id', 'type'],
                    additionalProperties: false,
                    properties: {
                        type: { type: 'number', description: '14: 방송 시작', enum: [14] },
                        guild_id: { type: 'string', description: '길드 아이디' },
                        channel_id: { type: 'string', description: '채널 아이디' },
                        custom_name: { type: 'string', description: '커스텀 이름' },
                        custom_ment: { type: 'string', description: '커스텀 멘션' },
                        hook_id: { type: 'string', description: '훅 아이디' },
                        hook_token: { type: 'string', description: '훅 토큰' },
                    },
                },
                response: {
                    200: { $ref: 'twitch/onlineChannel#' },
                },
            },
        },
        async req =>
            await webhookUpdate({
                ...req.body,
                user_id: req.user.id,
            })
    );

    fastify.patch<{
        Querystring: { id: string[] };
    }>(
        '/update/user',
        {
            schema: {
                tags: ['Twitch'],
                summary: '사용자 정보 갱신',
                description: '사용자 정보 업데이트',
                querystring: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                        },
                    },
                },
            },
        },
        async req => {
            //
            const { id } = req.query;
            return id;
        }
    );
};
