import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import { getMessageList, createMessage, updateMessage } from 'controllers/message';

import { Paging } from 'interfaces/swagger';
import { MessageCreate } from 'interfaces/message';

import irc from 'utils/twitchIrc';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.addSchema({
        $id: 'message',
        type: 'object',
        properties: {
            tag: { type: 'string' },
        },
    });

    const _messageSchema = {
        allOf: [
            { $ref: 'message#' },
            {
                type: 'object',
                properties: {
                    tts_yn: { type: 'string', enum: ['Y', 'N'] },
                    ephemeral_yn: { type: 'string', enum: ['Y', 'N'] },
                },
            },
        ],
    };

    //
    fastify.get<{
        Querystring: Paging;
    }>(
        '/message',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                tags: ['Admin'],
                description: '메세지 리스트 조회',
                querystring: { $ref: 'paging#' },
                response: {
                    200: {
                        type: 'array',
                        items: {
                            allOf: [
                                {
                                    type: 'object',
                                    properties: {
                                        context_id: { type: 'number' },
                                    },
                                },
                                { $ref: 'message#' },
                                {
                                    type: 'object',
                                    properties: {
                                        message_id: { type: 'number' },
                                        tts: { type: 'boolean' },
                                        ephemeral: { type: 'boolean' },
                                        create_at: { type: 'string' },
                                        update_at: { type: 'string' },
                                    },
                                },
                            ],
                        },
                    },
                },
            },
        },
        async (req, res) => await getMessageList(req.query.page || 0)
    );

    fastify.post<{
        Body: MessageCreate;
    }>(
        '/message',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                tags: ['Admin'],
                description: '메세지 생성',
                body: {},
                response: {
                    200: { $ref: 'sqlResult#' },
                },
            },
        },
        async (req, res) => await createMessage(req.body)
    );

    fastify.patch<{
        Body: MessageCreate;
        Params: { message_id: number };
    }>(
        '/message/:message_id',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '임베드 생성',
                tags: ['Admin'],
                params: {
                    type: 'object',
                    properties: {
                        message_id: { type: 'number' },
                    },
                },
                body: _messageSchema,
                response: {
                    200: { $ref: 'sqlResult#' },
                },
            },
        },
        async req => await updateMessage(req.params.message_id, req.body)
    );

    fastify.post<{
        Body: { message: string; target: string };
    }>(
        '/twitch/message',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                summary: '트위치 채팅방에 메세지 전송',
                description: '트위치 채팅방에 메세지를 전송 합니다.',
                tags: ['Admin'],
                body: {
                    type: 'object',
                    required: ['message', 'target'],
                    properties: {
                        message: { type: 'string', description: '메세지 내용 입니다.' },
                        target: { type: 'string', description: '메세지를 전송하는 채널 입니다.' },
                    },
                },
            },
        },
        (req, res) => {
            const { message, target } = req.body;

            irc.say(target, message)
                .then(data => {
                    res.send({ result: 'success', message: '메세지 전송 성공', data });
                })
                .catch(err => {
                    res.send({ result: 'fail', message: '메세지 전송 실패', err });
                });
        }
    );
};
