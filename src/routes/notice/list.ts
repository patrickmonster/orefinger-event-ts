import { selectNoticeLiveOnList } from 'controllers/notification';
import { FastifyInstance } from 'fastify';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.get(
        '',
        {
            schema: {
                description: '진행중인 라이브 리스트를 불러옵니다',
                tags: ['Notice'],
                deprecated: false,
            },
        },
        async req => await selectNoticeLiveOnList()
    );
};
