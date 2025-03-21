import { FastifyInstance } from 'fastify';

import {
    createComponent,
    getComponentOptionList,
    selectComponentDtil,
    selectComponentList,
    updateComponent,
    upsertComponentOptionConnect,
} from 'controllers/component';
import { ComponentCreate, ComponentOptionCreate } from 'interfaces/component';

import { Paging } from 'interfaces/swagger';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.addSchema({
        $id: 'component',
        type: 'object',
        required: ['name', 'type_idx', 'style_id'],
        properties: {
            name: { type: 'string' },
            label_id: { type: 'number' },
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

    fastify.addSchema({
        $id: 'componentOption',
        type: 'object',
        properties: {
            label_id: { type: 'number' },
            value: { type: 'string' },
            description_id: { type: 'number' },
            emoji: { type: 'string' },
            permission_type: { type: 'number' },
            create_at: { type: 'string' },
            update_at: { type: 'string' },
        },
    });

    ////////////////////////////////////////////////////////////

    fastify.get<{
        Querystring: Paging;
    }>(
        '/component',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '컴포넌트 리스트 조회',
                tags: ['System'],
                deprecated: false,
                querystring: {
                    allOf: [{ $ref: 'paging#' }],
                },
            },
        },
        async req => await selectComponentList(req.query)
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
                tags: ['System'],
                deprecated: false,
                params: {
                    type: 'object',
                    required: ['component_id'],
                    properties: {
                        component_id: { type: 'number' },
                    },
                },
            },
        },
        async req => await selectComponentDtil(req.params.component_id)
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
                tags: ['System'],
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
                tags: ['System'],
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

    fastify.get<{
        Querystring: Paging;
    }>(
        '/component/option',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '컴포넌트 옵션 리스트 조회',
                tags: ['System'],
                deprecated: false,
                querystring: {
                    allOf: [{ $ref: 'paging#' }],
                },
            },
        },
        async req => await getComponentOptionList(req.query)
    );

    fastify.post<{
        Body: ComponentOptionCreate;
    }>(
        '/component/option',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '컴포넌트 옵션 생성',
                tags: ['System'],
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

    // fastify.get<{
    //     Params: { component_id: number };
    //     Querystring: Paging & {
    //         use_yn?: 'Y' | 'N';
    //     };
    // }>(
    //     '/component/:component_id/options',
    //     {
    //         onRequest: [fastify.masterkey],
    //         schema: {
    //             security: [{ Master: [] }],
    //             description: '컴포넌트 옵션 연결 수정',
    //             tags: ['System'],
    //             deprecated: false,
    //             params: {
    //                 type: 'object',
    //                 required: ['option_id'],
    //                 properties: {
    //                     component_id: { type: 'number' },
    //                 },
    //             },
    //             body: {
    //                 allOf: [
    //                     { $ref: 'paging#' },
    //                     {
    //                         type: 'array',
    //                         properties: {
    //                             use_yn: { type: 'string', enum: ['Y', 'N'] },
    //                         },
    //                     },
    //                 ],
    //             },
    //         },
    //     },
    //     // async req => await updateComponentOption(req.params.option_id, req.body)
    //     async req => {
    //         const { component_id } = req.params;
    //     }
    // );

    fastify.patch<{
        Params: { component_id: number };
        Body: {
            option_id: number;
            use_yn: 'Y' | 'N';
        }[];
    }>(
        '/component/:component_id/options',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '컴포넌트 옵션 연결 수정',
                tags: ['System'],
                deprecated: false,
                params: {
                    type: 'object',
                    required: ['option_id'],
                    properties: {
                        component_id: { type: 'number' },
                    },
                },
                body: {
                    type: 'array',
                    properties: {
                        option_id: { type: 'number' },
                        use_yn: { type: 'string', enum: ['Y', 'N'] },
                    },
                },
            },
        },
        // async req => await updateComponentOption(req.params.option_id, req.body)
        async req => {
            const { component_id } = req.params;
            return await upsertComponentOptionConnect(
                req.body.map(item => ({
                    component_id: component_id,
                    option_id: item.option_id,
                    use_yn: item.use_yn,
                }))
            );
        }
    );
};
