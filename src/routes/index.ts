import { FastifyInstance } from 'fastify';

import auth from './auth';
import bot from './bot';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.register(auth);

    // 개발환경에서는 앱을 켜지 않음.
    process.env.MASTER_KEY && fastify.register(bot);

    fastify.get('/ping', { schema: { hide: true } }, async (req, res) => 'pong');
    fastify.get('/', { schema: { hide: true } }, (q, r) => r.redirect('https://orefinger.click'));

    fastify.get('/callback', { schema: { hide: true } }, (req, res) => ({
        query: req.query,
        headers: req.headers,
    }));
};
