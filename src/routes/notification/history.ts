import { selectNoticeHistoryById, selectNoticeHistoryDtailById } from 'controllers/notification';
import { FastifyInstance } from 'fastify';
import { Paging } from 'interfaces/swagger';
import { catchRedis, REDIS_KEY } from 'utils/redis';

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
            catchRedis(
                REDIS_KEY.API.CHANNEL_HISTORY_LIVE(`${req.query.id}:${req.query.limit || 10}:${req.query.page}`),
                async () => await selectNoticeHistoryById(req.query, req.query.id),
                60 * 60 * 1
            )
    );
    fastify.get<{
        Querystring: Paging & {
            id: number;
        };
    }>(
        '/historyDetail',
        {
            schema: {
                description: '라이브의 히스토리 상세를 불러옵니다',
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
            catchRedis(
                REDIS_KEY.API.CHANNEL_HISTORY_LIVE(`${req.query.id}:${req.query.limit || 10}:${req.query.page}`),
                async () => await selectNoticeHistoryDtailById(req.query, req.query.id),
                60 * 60 * 1
            )
    );
};
