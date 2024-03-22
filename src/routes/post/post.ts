import { getPostDil, getPostTypes, postPost, selectPostList } from 'controllers/post';
import { FastifyInstance } from 'fastify';
import { Paging } from 'interfaces/swagger';
export default async (fastify: FastifyInstance, opts: any) => {
    const postTypes = await getPostTypes();

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
                                    enum: postTypes.map(v => v.type_id),
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
                        type: { type: 'string' },
                        use_yn: { type: 'string', enum: ['Y', 'N'] },
                        commant_yn: { type: 'string', enum: ['Y', 'N'] },
                        public_yn: { type: 'string', enum: ['Y', 'N'] },
                    },
                },
            },
        },
        async req => await postPost(req.user.id, req.body)
    );
};
