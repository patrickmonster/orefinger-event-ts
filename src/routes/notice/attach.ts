import { selectAttachList } from 'components/notice';
import { selectNoticeByPk } from 'controllers/notice';
import { FastifyInstance } from 'fastify';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.get<{
        Params: { live_id: string };
        Querystring: {
            range?: number; // 조회 범위 1개월, 3개월, 6개월, 12개월
        };
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
                querystring: {
                    type: 'object',
                    properties: {
                        range: { type: 'number', description: '조회 범위', enum: [1, 3, 6, 12] },
                    },
                },
            },
        },
        async req => {
            const detail = await selectNoticeByPk(req.params.live_id);

            if (!detail) {
                return fastify.httpErrors.notFound('사용자 정보를 찾을 수 없습니다');
            }
            const list = await selectAttachList(req.params.live_id, req.query.range || 1);

            return {
                ...detail,
                list,
            };
        }
    );

    // selectNoticeByPk(req.params.id)
};
