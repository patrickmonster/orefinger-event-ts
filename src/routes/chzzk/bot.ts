import { deleteCommand, selectCommand, upsertCommand } from 'controllers/chat/chzzk';
import { FastifyInstance } from 'fastify';

import { ENCRYPT_KEY, sha256 } from 'utils/cryptoPw';

export default async (fastify: FastifyInstance, opts: any) => {
    // 치지직 유저의 권한을 확인합니다.
    const hasPermission = async (userId: string) => {
        //
    };

    // 해당 사용자 토큰을 발급 합니다.
    fastify.get<{
        Params: { hashId: string };
    }>(
        '/bot/:hashId/token',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
                description: `채널 권한을 업데이트 합니다.`,
                summary: '권한업데이트',
                tags: ['ChzzkBot', 'Chzzk'],
                deprecated: false,
                params: {
                    type: 'object',
                    required: ['hashId'],
                    properties: {
                        hashId: {
                            type: 'string',
                            description: '치지직 채널 아이디',
                        },
                    },
                },
            },
        },
        async req => {
            const { id } = req.user;
            const key = sha256(`${id}:${req.params.hashId}`, ENCRYPT_KEY).replace(/[^a-zA-Z0-9]/g, '');

            return `@AUTH ${id} ${key}`;
        }
    );

    fastify.get<{
        Params: { hashId: string };
    }>(
        '/bot/:hashId',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
                description: `명령어를 조회합니다.`,
                summary: '명령어 조회',
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
                description: `명령어를 삭제합니다.`,
                summary: '명령어 삭제',
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
                summary: '명령어 생성',
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
