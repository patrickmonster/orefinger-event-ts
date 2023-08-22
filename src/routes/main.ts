import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import path from 'path';
import { createSubscribe } from 'utils/token';

export default async (fastify: FastifyInstance, opts: any) => {
    //
    fastify.get('/ping', { schema: { hide: true } }, async (req, res) => 'pong');

    if (process.env.MASTER_KEY) {
        // 운영
        fastify.get('/', { schema: { hide: true } }, (q, r) => r.redirect('https://orefinger.click'));
    } else {
        // 개발 백도어
        fastify.register(require('@fastify/static'), {
            root: path.join(__dirname, 'public'),
            prefix: '/dev/',
        });
    }

    fastify.get('/callback', { schema: { hide: true } }, (req, res) => {
        return {
            query: req.query,
            headers: req.headers,
        };
    });

    // 이벤트 등록
    fastify.get<{
        Params: { broadcaster_user_id: string };
    }>('/register/:broadcaster_user_id', { schema: { hide: true } }, req => {
        const { broadcaster_user_id } = req.params;
        const events = ['stream.online', 'stream.offline', 'channel.update'];

        for (const type of events) {
            createSubscribe({ type, condition: { broadcaster_user_id } }).catch(console.error);
        }

        return { success: true, events };
    });
};
