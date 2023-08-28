'use strict';
import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { FastifyRequest, FastifyReply } from 'fastify';

declare module 'fastify' {
    interface FastifyInstance {
        masterkey: (request: FastifyRequest, reply: FastifyReply, done: Function) => void;
        authenticate: (request: FastifyRequest, reply: FastifyReply, done: Function) => void;
    }
}

declare module '@fastify/jwt' {
    interface FastifyJWT {
        SignPayloadType: {
            id: string;
            access_token: string;
            refresh_token?: string;
        };
        payload: {
            id: string;
            access_token: string;
        };
        user: {
            id: string;
            access_token: string;
            refresh_token: string;
        };
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

    fastify.decorate('masterkey', async function (request: FastifyRequest, reply: FastifyReply, done: Function) {
        const key = request.headers.master || request.headers.Master;
        if (process.env.MASTER_KEY && key !== process.env.MASTER_KEY) {
            reply.code(400).send({ error: 'invalid key', key });
        } else done();
    });

    fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply, done: Function) {
        try {
            await request.jwtVerify();
            done();
        } catch (err) {
            reply.send(err);
        }
    });
});
