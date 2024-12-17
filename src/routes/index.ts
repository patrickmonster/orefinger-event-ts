import { FastifyInstance } from 'fastify';

import auth from './auth';
import bot from './bot';
import chzzk from './redirect';
import user from './user';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.register(auth);
    fastify.register(user);
    fastify.register(bot);
    fastify.register(chzzk);

    fastify.get('/ping', { schema: { hide: true } }, async (req, res) => 'pong');
    fastify.get('/', { schema: { hide: true } }, (q, r) => r.redirect('https://orefinger.click'));

    fastify.get('/callback', { schema: { hide: true } }, (req, res) => ({
        query: req.query,
        headers: req.headers,
    }));

    fastify.get<{
        Params: { target: string };
    }>(
        '/l/:target',
        {
            schema: {
                hide: true,
                params: {
                    type: 'object',
                    properties: {
                        target: { type: 'string' },
                    },
                },
            },
        },
        (q, r) => {
            const { target } = q.params;

            //r.redirect('https://orefinger.click')
        }
    );
};
