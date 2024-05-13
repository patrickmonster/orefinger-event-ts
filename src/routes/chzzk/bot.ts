import { deleteCommand, selectCommand, upsertCommand } from 'controllers/chat/chzzk';
import { FastifyInstance } from 'fastify';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.get<{
        Params: { hashId: string };
    }>(
        '/bot/:hashId',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
                description: `명령어를 조회합니다.`,
                tags: ['ChzzkBot', 'Chzzk'],
                deprecated: false,
                params: {
                    type: 'object',
                    required: ['hashId'],
                    properties: {
                        hashId: {
                            type: 'string',
                            description: '해시 아이디',
                        },
                    },
                },
            },
        },
        async req => await selectCommand(req.params.hashId)
    );

    fastify.delete<{
        Params: { hashId: string };
        Querystring: { command: string };
    }>(
        '/bot/:hashId',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
                description: `명령어를 조회합니다.`,
                tags: ['ChzzkBot', 'Chzzk'],
                deprecated: false,
                params: {
                    type: 'object',
                    required: ['hashId'],
                    properties: {
                        hashId: {
                            type: 'string',
                            description: '해시 아이디',
                        },
                    },
                },
                querystring: {
                    type: 'object',
                    required: ['command'],
                    properties: {
                        command: {
                            type: 'string',
                            description: '명령어',
                        },
                    },
                },
            },
        },
        async req => await deleteCommand(req.params.hashId, req.query.command)
    );

    fastify.post<{
        Params: { hashId: string };
        Body: { command: string; message: string; type: number };
    }>(
        '/bot/:hashId',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
                description: `명령어를 생성합니다.`,
                tags: ['ChzzkBot', 'Chzzk'],
                deprecated: false,
                params: {
                    type: 'object',
                    required: ['hashId'],
                    properties: {
                        hashId: {
                            type: 'string',
                            description: '해시 아이디',
                        },
                    },
                },
                body: {
                    type: 'object',
                    required: ['command', 'message'],
                    properties: {
                        command: {
                            type: 'string',
                            description: '명령어',
                        },
                        message: {
                            type: 'string',
                            description: '응답',
                        },
                        type: {
                            type: 'number',
                            description: '타입',
                            enum: [1],
                        },
                    },
                },
            },
        },
        async req => {
            const { hashId } = req.params;
            const { command, message, type } = req.body;

            return await upsertCommand(hashId, { command, message, type });
        }
    );
};
