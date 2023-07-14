import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import { getComponentOptionList, getComponentOptionDtil } from 'controllers/component';
import { ComponentOptionCreate } from 'interfaces/component';

import { Paging } from 'interfaces/swagger';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.addSchema({
        $id: 'componentOption',
        type: 'object',
        properties: {
            // option_id: { type: 'number' },
            label_id: { type: 'number' },
            value: { type: 'string' },
            description_id: { type: 'number' },
            emoji: { type: 'string' },
            permission_type: { type: 'number' },
            create_at: { type: 'string' },
            update_at: { type: 'string' },
        },
    });

    fastify.get<{
        Querystring: Paging;
    }>(
        '/option',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '컴포넌트 옵션 리스트 조회',
                tags: ['Admin'],
                deprecated: false,
                querystring: {
                    allOf: [{ $ref: 'paging#' }],
                },
                response: {
                    200: {
                        type: 'array',
                        items: {
                            allOf: [
                                { $ref: 'componentOption#' },
                                {
                                    type: 'object',
                                    properties: {
                                        default: { type: 'boolean' },
                                        use: { type: 'boolean' },
                                    },
                                },
                            ],
                        },
                    },
                },
            },
        },
        async req => await getComponentOptionList(req.query.page || 0)
    );

    fastify.post<{
        Body: ComponentOptionCreate;
    }>(
        '/option',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '컴포넌트 옵션 생성',
                tags: ['Admin'],
                deprecated: false,
                body: {
                    allOf: [
                        { $ref: 'componentOption#' },
                        {
                            type: 'object',
                            properties: {
                                default: { type: 'boolean' },
                                use: { type: 'boolean' },
                            },
                        },
                    ],
                },
                response: {
                    200: {
                        type: 'array',
                        items: {
                            allOf: [
                                { $ref: 'componentOption#' },
                                {
                                    type: 'object',
                                    properties: {
                                        default: { type: 'boolean' },
                                        use: { type: 'boolean' },
                                    },
                                },
                            ],
                        },
                    },
                },
            },
        },
        async req => {
            //
        }
    );

    fastify.get<{
        Querystring: Paging;
        Params: { option_id: number };
    }>(
        '/option/:option_id',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '컴포넌트 옵션 상세 조회',
                tags: ['Admin'],
                deprecated: false,
                querystring: {
                    $ref: 'paging#',
                },
                response: {
                    200: {
                        allOf: [
                            { $ref: 'componentOption#' },
                            {
                                type: 'object',
                                properties: {
                                    label: { type: 'string' },
                                    description: { type: 'string' },
                                    default: { type: 'boolean' },
                                    use: { type: 'boolean' },
                                },
                            },
                        ],
                    },
                },
            },
        },
        async req => await getComponentOptionDtil(req.params.option_id)
    );
};
