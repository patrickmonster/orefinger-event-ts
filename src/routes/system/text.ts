import { FastifyInstance } from 'fastify';

import { selectText, TextPk, Text as TextType, upsertText } from 'controllers/system/text';
import { Paging } from 'interfaces/swagger';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.addSchema({
        $id: 'textMessage',
        type: 'object',
        required: ['name'],
        properties: {
            name: { type: 'string', description: '텍스트 설명' },
            language_cd: { type: 'number', description: '언어 코드' },
            text: {
                type: 'string',

                description: '저장되어 보여질 메세지 (string)',
            },
        },
    });

    fastify.get<{
        Querystring: Paging & {
            search?: string;
            language_cd?: number;
        };
    }>(
        '/text',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                tags: ['System'],
                description: '텍스트 리스트 조회',
                querystring: {
                    allOf: [
                        {
                            $ref: 'paging#',
                        },
                        {
                            type: 'object',
                            properties: {
                                search: { type: 'string', description: '검색어', nullable: true },
                            },
                        },
                    ],
                },
            },
        },
        async req => await selectText(req.query, req.query)
    );

    fastify.post<{
        Body: TextType;
        Querystring: TextPk;
    }>(
        '/text',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                tags: ['System'],
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
        async req => await upsertText(req.body, req.query)
    );
};
