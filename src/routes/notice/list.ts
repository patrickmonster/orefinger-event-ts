import { selectNotice, selectNoticeLiveOnList, selectType } from 'controllers/notification';
import { FastifyInstance } from 'fastify';
import { Paging } from 'interfaces/swagger';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.get(
        '/type',
        {
            schema: {
                description: '알림 타입 리스트를 불러옵니다',
                tags: ['Notice'],
                deprecated: false,
            },
        },
        async req => await selectType()
    );

    fastify.get(
        '/online',
        {
            schema: {
                description: '진행중인 라이브 리스트를 불러옵니다',
                tags: ['Notice'],
                deprecated: false,
            },
        },
        async req => await selectNoticeLiveOnList()
    );

    fastify.get<{
        Querystring: Paging & {
            type?: number;
            hash?: string;
        };
    }>(
        '',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '공지사항 리스트를 불러옵니다',
                tags: ['Notice'],
                deprecated: false,
                querystring: {
                    allOf: [
                        { $ref: 'paging#' },
                        {
                            type: 'object',
                            properties: {
                                type: { type: 'number' },
                                hash: { type: 'string' },
                            },
                        },
                    ],
                },
            },
        },
        async req => await selectNotice(req.query, req.query)
    );
};
