import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import { getTextList, createText, updateText } from 'controllers/text';

import { Paging } from 'interfaces/swagger';
import { TextCreate } from 'interfaces/text';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.addSchema({
        $id: 'textMessage',
        type: 'object',
        required: ['tag'],
        properties: {
            tag: { type: 'string', description: '텍스트 설명' },
            message: {
                type: 'string',

                description: '저장되어 보여질 메세지 (string)',
            },
        },
    });

    fastify.get<{
        Querystring: Paging;
    }>(
        '/text',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                tags: ['Admin'],
                description: '텍스트 리스트 조회',
                querystring: { $ref: 'paging#' },
                response: {
                    200: {
                        type: 'array',
                        items: {
                            allOf: [
                                { $ref: 'textMessage#' },
                                {
                                    type: 'object',
                                    properties: {
                                        text_id: { type: 'number' },
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
        async req => await getTextList(req.query.page || 0)
    );

    fastify.post<{
        Body: TextCreate;
    }>(
        '/text',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                tags: ['Admin'],
                description: '텍스트 생성',
                body: { $ref: 'textMessage#' },
                response: {
                    200: { $ref: 'sqlResult#' },
                },
            },
        },
        async req => await createText(req.body)
    );

    fastify.patch<{
        Body: TextCreate;
    }>(
        '/text',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                tags: ['Admin'],
                description: '텍스트 생성',
                params: {
                    type: 'object',
                    properties: {
                        text_id: { type: 'number' },
                    },
                },
                body: { $ref: 'textMessage#' },
                response: {
                    200: { $ref: 'sqlResult#' },
                },
            },
        },
        async req => await createText(req.body)
    );
};
