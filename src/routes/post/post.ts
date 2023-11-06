import { commantPost, getCommantList, getPostDil, getPostTypes, postPost, selectPostList } from 'controllers/post';
import { FastifyInstance } from 'fastify';
import { Paging } from 'interfaces/swagger';
export default async (fastify: FastifyInstance, opts: any) => {
    //
    const postTypes = ['null', '0', 'DN', 'NT'];

    fastify.get<{
        Querystring: Paging & {
            type: '0';
        };
    }>(
        '',
        {
            onRequest: [fastify.authenticateQuarter],
            schema: {
                tags: ['post'],
                description: '게시글 목록 조회',
                deprecated: false,
                querystring: {
                    allOf: [
                        { $ref: 'paging#' },
                        {
                            type: 'object',
                            properties: {
                                type: {
                                    type: 'string',
                                    nullable: true,
                                    enum: postTypes,
                                },
                            },
                        },
                    ],
                },
            },
        },
        async request =>
            await selectPostList(request.query, {
                type: request.query?.type,
                user_id: request.user?.id,
            })
    );
    fastify.get(
        '/type',
        {
            schema: {
                tags: ['post'],
                description: '게시글 타입 목록 조회',
                deprecated: false,
            },
        },
        async request => await getPostTypes()
    );

    fastify.get<{
        Querystring: {
            type: '0';
        };
        Params: {
            count: string;
        };
    }>(
        '/top/:count',
        {
            onRequest: [fastify.authenticateQuarter],
            schema: {
                tags: ['post'],
                description: '게시글 목록 조회',
                deprecated: false,
                querystring: {
                    type: 'object',
                    properties: {
                        type: {
                            type: 'string',
                            enum: postTypes,
                        },
                    },
                },
                params: {
                    type: 'object',
                    properties: {
                        count: {
                            type: 'string',
                            enum: ['5', '10', '15', '20'],
                        },
                    },
                },
            },
        },
        async request =>
            await selectPostList(
                {
                    page: 0,
                    limit: Number(request.params.count),
                },
                {
                    type: request.query?.type,
                    user_id: request.user?.id,
                }
            ).then(res => res.list)
    );

    fastify.get<{
        Params: {
            id: string;
        };
    }>(
        'Dtail/:id',
        {
            onRequest: [fastify.authenticateQuarter],
            schema: {
                tags: ['post'],
                description: '게시글 조회',
                deprecated: false,
                params: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                        },
                    },
                },
            },
        },
        async request => {
            return await getPostDil(request.params.id, request.user?.id);
        }
    );

    fastify.post<{
        Body: {
            title: string;
            description: string;
            type: string;
            use_yn?: string;
            commant_yn?: string;
            public_yn?: string;
        };
    }>(
        '',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
                tags: ['post'],
                description: '게시글 작성',
                deprecated: false,
                body: {
                    type: 'object',
                    required: ['title', 'description', 'type'],
                    properties: {
                        title: { type: 'string', maxLength: 255, minLength: 1 },
                        description: { type: 'string' },
                        type: { type: 'string', enum: postTypes },
                        use_yn: { type: 'string', enum: ['Y', 'N'] },
                        commant_yn: { type: 'string', enum: ['Y', 'N'] },
                        public_yn: { type: 'string', enum: ['Y', 'N'] },
                    },
                },
            },
        },
        async req => await postPost(req.user.id, req.body)
    );

    fastify.get<{
        Querystring: Paging;
        Params: {
            id: string;
        };
    }>(
        '/commant/:id',
        {
            schema: {
                tags: ['post'],
                description: '게시글 덧글 조회',
                deprecated: false,
                params: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                        },
                    },
                },
                querystring: {
                    $ref: 'paging#',
                },
            },
        },
        async request => await getCommantList(request.params.id, request.query)
    );

    fastify.post<{
        Body: {
            message: string;
            parent_id?: string;
        };
        Params: {
            id: string;
        };
    }>(
        '/commant/:id',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
                tags: ['post'],
                description: '게시글 덧글 작성',
                deprecated: false,
                params: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                        },
                    },
                },
                body: {
                    type: 'object',
                    required: ['message'],
                    properties: {
                        message: { type: 'string', maxLength: 255, minLength: 1 },
                        parent_id: { type: 'string', nullable: true },
                    },
                },
            },
        },
        async request =>
            await commantPost(request.user.id, {
                ...request.body,
                post_id: request.params.id,
            })
    );
};
