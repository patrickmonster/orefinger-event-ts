import { selectAttachList } from 'components/notice';
import { FastifyInstance } from 'fastify';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.get<{
        Params: { live_id: string };
    }>(
        '/atttach/:live_id',
        {
            schema: {
                description: '채널의 라이브 출석 리스트를 불러옵니다.',
                tags: ['Notice'],
                deprecated: false,
                params: {
                    type: 'object',
                    properties: {
                        live_id: { type: 'string', description: '라이브 아이디' },
                    },
                },
            },
        },
        async req => await selectAttachList(req.params.live_id)
    );
};
