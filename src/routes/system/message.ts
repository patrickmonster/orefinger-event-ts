import { FastifyInstance } from 'fastify';

import { selectMessageList, updateMessage } from 'controllers/message';

import { MessageCreate } from 'interfaces/message';
import { Paging } from 'interfaces/swagger';

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
        Querystring: Paging & {
            tag?: string;
        };
    }>(
        '/message',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                tags: ['System'],
                description: '메세지 리스트 조회',
                querystring: {
                    allOf: [
                        { $ref: 'paging#' },
                        {
                            type: 'object',
                            properties: {
                                tag: { type: 'string', description: '태그', nullable: true },
                            },
                        },
                    ],
                },
            },
        },
        async req => await selectMessageList(req.query.page || 0, req.query.tag)
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
                tags: ['System'],
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
};
