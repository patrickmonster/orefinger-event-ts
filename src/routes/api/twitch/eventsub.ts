import { GetSubscribe } from 'utils/twitchApiInstance';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { tokens } from 'controllers/auth';

// 이벤트 서버 조회모듈
export default async (fastify: FastifyInstance, opts: any) => {
    //

    fastify.get<{
        Params: {
            user_id: string;
        };
    }>(
        '/event/:user_id',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '트위치 사용자의 등록된 이벤트를 조회합니다.',
                summary: '사용자 이벤트 조회',
                tags: ['Twitch'],
                params: {
                    type: 'object',
                    properties: {
                        user_id: { type: 'string' },
                    },
                },
            },
        },
        async req => {
            const { user_id } = req.params;

            return await GetSubscribe({
                user_id,
            }).catch(e => {
                console.error(e);
            });
        }
    );

    fastify.get(
        '/event',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
                description: '트위치 사용자의 등록된 이벤트를 조회합니다.',
                summary: '사용자 이벤트 조회',
                tags: ['Twitch'],
            },
        },
        async req => {
            const { id } = req.user;

            //  사용자 정보 조회
            const ids = new Set((await tokens(id, 2, 3)).map(({ user_id }) => user_id));

            return await Promise.all(
                [...ids].map(user_id =>
                    GetSubscribe({
                        user_id,
                    }).then(({ data }) => data)
                )
            );
            // .then(data => data.reduce((a, b) => [...a, ...b], []));
        }
    );
};
