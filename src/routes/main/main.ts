import { FastifyInstance } from 'fastify';

import { getTotal, getUser } from 'controllers/main';
import { REDIS_KEY, catchRedis } from 'utils/redis';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.get(
        '/total',
        {
            schema: {
                description: '통계 정보를 조회 합니다',
                summary: '통계 정보 조회',
                tags: ['Main'],
                deprecated: false,
            },
        },
        async req => await catchRedis(REDIS_KEY.API.MAIN_TOTAL, getTotal, 60 * 10)
    );

    fastify.get<{
        Params: { userId: string };
    }>(
        '/user/:userId',
        {
            config: {
                rateLimit: {
                    max: 10,
                    timeWindow: '1 minute',
                },
            },
            schema: {
                description: '사용자 연동 정보를 확인합니다.',
                summary: '연동 정보 조회',
                tags: ['Main'],
                deprecated: false,
                params: {
                    type: 'object',
                    properties: {
                        userId: {
                            $ref: 'authId#',
                        },
                    },
                },
                response: {
                    200: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                user_id: { $ref: 'authId#' },
                                name: { type: 'string', nullable: true },
                                kr_name: { type: 'string' },
                                avatar: { type: 'string', nullable: true },
                                is_session: { type: 'boolean' },
                                create_at: { type: 'string', nullable: true },
                                update_at: { type: 'string', nullable: true },
                            },
                        },
                    },
                },
            },
        },
        async req => await getUser(req.params.userId)
    );
    //
};
