import { getErrorLogs } from 'controllers/admin';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Paging } from 'interfaces/swagger';

export default async (fastify: FastifyInstance, opts: any) => {
    //
    fastify.get<{
        Querystring: Paging;
    }>(
        '/log',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '로그 조회',
                summary: '로그 조회',
                tags: ['System'],
                querystring: {
                    allOf: [
                        { $ref: 'paging#' },
                        {
                            type: 'object',
                            properties: {},
                        },
                    ],
                },
            },
        },
        async req => await getErrorLogs(req.query.page || 0)
    );
};
