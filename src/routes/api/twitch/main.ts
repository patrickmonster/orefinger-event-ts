import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { attendance } from 'controllers/twitch';

export default async (fastify: FastifyInstance, opts: any) => {
    //

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
                // createSubscribe({ type, condition: { broadcaster_user_id } }).catch(console.error);
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
};
