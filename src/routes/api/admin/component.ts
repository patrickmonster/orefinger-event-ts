import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import { getComponentList, createComponent, updateComponent, getComponentDtil } from 'controllers/component';
import { ComponentCreate } from 'interfaces/component';

import { Paging } from 'interfaces/swagger';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.addSchema({
        $id: 'component',
        type: 'object',
        required: ['name', 'type_idx', 'style_id'],
        properties: {
            name: { type: 'string' },
            label_id: { type: 'number' },
            label_lang: { type: 'number' },
            type_idx: { type: 'number' },
            text_id: { type: 'number' },
            emoji: { type: 'string' },
            custom_id: { type: 'string' },
            value: { type: 'string' },
            style: { type: 'number' },
            min_values: { type: 'number' },
            max_values: { type: 'number' },
            permission_type: { type: 'number' },
            create_at: { type: 'string' },
            update_at: { type: 'string' },
            order_by: { type: 'number' },
        },
    });

    fastify.get<{
        Querystring: Paging;
    }>(
        '/component',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '컴포넌트 리스트 조회',
                tags: ['Admin'],
                deprecated: false,
                querystring: {
                    allOf: [{ $ref: 'paging#' }],
                },
                // response: {
                //     200: {
                //         type: 'array',
                //         items: {
                //             allOf: [
                //                 {
                //                     type: 'object',
                //                     properties: {
                //                         component_id: { type: 'number' },
                //                     },
                //                 },
                //                 { $ref: 'component#' },
                //                 {
                //                     type: 'object',
                //                     properties: {
                //                         use: { type: 'boolean' },
                //                         edit: { type: 'boolean' },
                //                     },
                //                 },
                //             ],
                //         },
                //     },
                // },
            },
        },
        async req => await getComponentList(req.query.page || 0)
    );

    fastify.get<{
        Params: { component_id: number };
    }>(
        '/component/:component_id',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '컴포넌트 상세 조회',
                tags: ['Admin'],
                deprecated: false,
                params: {
                    type: 'object',
                    required: ['component_id'],
                    properties: {
                        component_id: { type: 'number' },
                    },
                },
                // response: {
                //     200: {
                //         allOf: [
                //             {
                //                 type: 'object',
                //                 properties: {
                //                     component_id: { type: 'number' },
                //                 },
                //             },
                //             { $ref: 'component#' },
                //             {
                //                 type: 'object',
                //                 properties: {
                //                     label: { type: 'string' },
                //                     text: { type: 'string' },
                //                     type_name: { type: 'string' },
                //                     style_name: { type: 'string' },
                //                     disabled: { type: 'boolean' },
                //                     required: { type: 'boolean' },
                //                     use: { type: 'boolean' },
                //                     edit: { type: 'boolean' },
                //                 },
                //             },
                //         ],
                //     },
                // },
            },
        },
        async req => await getComponentDtil(req.params.component_id)
    );

    fastify.post<{
        Body: ComponentCreate;
    }>(
        '/component',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '컴포넌트 생성',
                tags: ['Admin'],
                deprecated: false,
                body: {
                    allOf: [
                        { $ref: 'component#' },
                        {
                            type: 'object',
                            properties: {
                                use_yn: { type: 'string', enum: ['Y', 'N'] },
                                edit_yn: { type: 'string', enum: ['Y', 'N'] },
                            },
                        },
                    ],
                },
                response: {
                    200: { $ref: 'sqlResult#' },
                },
            },
        },
        async req => await createComponent(req.body)
    );

    fastify.patch<{
        Body: ComponentCreate;
        Params: { component_id: number };
    }>(
        '/component/:component_id',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '컴포넌트 수정',
                tags: ['Admin'],
                deprecated: false,
                params: {
                    type: 'object',
                    required: ['component_id'],
                    properties: {
                        component_id: { type: 'number' },
                    },
                },
                body: {
                    allOf: [
                        { $ref: 'component#' },
                        {
                            type: 'object',
                            properties: {
                                use_yn: { type: 'string', enum: ['Y', 'N'] },
                                edit_yn: { type: 'string', enum: ['Y', 'N'] },
                            },
                        },
                    ],
                },
                response: {
                    200: { $ref: 'sqlResult#' },
                },
            },
        },
        async req => await updateComponent(req.params.component_id, req.body)
    );
};
