import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { attendance } from 'controllers/twitch';

export default async (fastify: FastifyInstance, opts: any) => {
    //

    const events = ['stream.online', 'stream.offline', 'channel.update'];

    fastify.post<{
        Params: { target: string };
        Body: { message: string; key: string };
    }>(
        '/message/:target',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '트위치 채팅방에 메세지를 전송 합니다.',
                tags: ['Admin'],
                params: {
                    type: 'object',
                    required: ['target'],
                    properties: {
                        target: { type: 'string', description: '메세지를 전송하는 채널 입니다.' },
                    },
                },
                body: {
                    type: 'object',
                    required: ['target', 'message', 'key'],
                    properties: {
                        message: { type: 'string', description: '메세지 내용 입니다.' },
                        key: { type: 'string', description: 'master key' },
                    },
                },
            },
        },
        (req, res) => {
            const { target } = req.params;
            const { message, key } = req.body;

            if (key != process.env.MASTER_KEY) {
                res.code(400).send({ error: 'invalid key' });
                return;
            }
            //

            res.send({ target, message });
        }
    );

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
