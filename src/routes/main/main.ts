import { FastifyInstance } from 'fastify';

import { getTotal } from 'controllers/main';
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
    //
};
