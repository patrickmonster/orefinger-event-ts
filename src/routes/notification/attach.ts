import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createYutubeUser, createYutubeChannel, createYutubeEvent, insertYoutubeVideo } from 'controllers/youtube';

import redis from 'utils/redis';
import { getUser } from 'components/twitch';

import { liveList, total, stream } from 'controllers/notification';
import { getAttendanceList, getAttendanceRankTotal } from 'controllers/twitch';

export default async (fastify: FastifyInstance, opts: any) => {
    const ATTACH_RNAK = 'db:ATTACH_RANK';

    fastify.get(
        '/atttach',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
                description: '출석 리스트를 불러옵니다.',
                tags: ['Notification'],
                deprecated: false,
            },
        },
        async req => await getAttendanceList(`${req.user?.id}`)
    );

    fastify.get<{
        Querystring: { isMyLank: boolean };
    }>(
        '/atttach/rank',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
                description: '출석 리스트를 불러옵니다.',
                tags: ['Notification'],
                deprecated: false,
                querystring: {
                    type: 'object',
                    properties: {
                        isMyLank: { type: 'boolean', default: false, description: '내 랭킹을 불러옵니다.' },
                    },
                },
            },
        },
        async req => {
            console.log(req.query);

            if (req.query.isMyLank) {
                const { id } = req.user;

                return await getAttendanceRankTotal(id);
            }
            const data = await redis.get(ATTACH_RNAK);
            if (data) return JSON.parse(data);

            return await getAttendanceRankTotal().then(data => {
                redis.set(ATTACH_RNAK, JSON.stringify(data), { EX: 60 * 60 * 24 * 7 });
                return data;
            });
        }
    );
};
