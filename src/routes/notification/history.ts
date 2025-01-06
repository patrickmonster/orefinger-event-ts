import { selectNoticeHistoryById } from 'controllers/notification';
import { FastifyInstance } from 'fastify';
import { Paging } from 'interfaces/swagger';
import { cacheRedis, REDIS_KEY } from 'utils/redis';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.get<{
        Querystring: Paging & {
            id: number;
        };
    }>(
        '/history',
        {
            schema: {
                description: '라이브의 히스토리 리스트를 불러옵니다',
                tags: ['Notice'],
                deprecated: false,
                querystring: {
                    allOf: [
                        { $ref: 'paging#' },
                        {
                            type: 'object',
                            required: ['id'],
                            properties: {
                                id: { type: 'number' },
                            },
                        },
                    ],
                },
            },
        },
        async req =>
            cacheRedis(
                REDIS_KEY.API.CHANNEL_HISTORY_LIVE(`${req.query.id}`),
                await selectNoticeHistoryById(req.query, req.query.id),
                60 * 60 * 1
            )
    );
};
