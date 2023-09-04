import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createYutubeUser, createYutubeChannel, createYutubeEvent, insertYoutubeVideo } from 'controllers/youtube';

import redis from 'utils/redis';
import { getUser } from 'components/twitch';

import { liveList, total, stream } from 'controllers/notification';
import { getAttendanceList } from 'controllers/twitch';

export default async (fastify: FastifyInstance, opts: any) => {
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
};
