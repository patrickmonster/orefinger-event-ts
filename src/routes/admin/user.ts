import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import { Paging } from 'interfaces/swagger';
import { getAuthUsers } from 'controllers/auth';

export default async (fastify: FastifyInstance, opts: any) => {
    //
    fastify.get<{
        Querystring: Paging & {
            auth_id?: string;
            user_id?: string;
            login?: string;
            name?: string;
        };
    }>(
        '/user',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '사용자 리스트 조회',
                summary: '사용자 조회',
                tags: ['Admin'],
                querystring: {
                    allOf: [
                        { $ref: 'paging#' },
                        {
                            type: 'object',
                            properties: {
                                auth_id: { type: 'string', description: '인증 아이디', nullable: true },
                                user_id: { type: 'string', description: '사용자 아이디', nullable: true },
                                login: { type: 'string', description: '로그인 아이디', nullable: true },
                                name: { type: 'string', description: '사용자 이름', nullable: true },
                            },
                        },
                    ],
                },
            },
        },
        async req => await getAuthUsers(req.query)
    );
};
