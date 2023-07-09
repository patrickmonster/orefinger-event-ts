'use strict';
import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { FastifyRequest, FastifyReply } from 'fastify';

declare module 'fastify' {
    interface FastifyInstance {
        masterkey: (request: FastifyRequest, reply: FastifyReply) => void;
    }
}

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp(async function (fastify, opts) {
    fastify.register(jwt, {
        secret: process.env.JWT_SECRET || 'secret',
    });

    fastify.decorate('masterkey', function (request: FastifyRequest, reply: FastifyReply) {
        if (process.env.MASTER_KEY && request.headers.Master !== process.env.MASTER_KEY) {
            reply.code(400).send({ error: 'invalid key' });
        }
    });

    fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(err);
        }
    });
});
