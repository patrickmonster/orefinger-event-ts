import { getPostList } from 'controllers/post';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Paging } from 'interfaces/swagger';
export default async (fastify: FastifyInstance, opts: any) => {
    //
    const postTypes = ['0', 'DN', 'NT'];

    fastify.get<{
        Querystring: Paging & {
            type: '0';
        };
    }>(
        '',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
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
                                    enum: postTypes,
                                },
                            },
                        },
                    ],
                },
            },
        },
        async request => await getPostList(request.query, request.user.id, request.query.type)
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
            await getPostList(
                {
                    page: 0,
                    limit: Number(request.params.count),
                },
                null,
                request.query.type
            ).then(res => res.list)
    );
};
