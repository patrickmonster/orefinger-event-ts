import { commantPost, getCommantList } from 'controllers/post';
import { FastifyInstance } from 'fastify';
import { Paging } from 'interfaces/swagger';
export default async (fastify: FastifyInstance, opts: any) => {
    //
    const postTypes = ['null', '0', 'DN', 'NT'];

    fastify.get<{
        Querystring: Paging;
        Params: {
            id: string;
        };
    }>(
        '/:id',
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
        '/:id',
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
