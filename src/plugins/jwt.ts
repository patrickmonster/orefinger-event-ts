'use strict';
import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { FastifyRequest, FastifyReply } from 'fastify';

declare module 'fastify' {
    interface FastifyInstance {
        masterkey: (request: FastifyRequest, reply: FastifyReply, done: Function) => void;
        authenticate: (request: FastifyRequest, reply: FastifyReply, done: Function) => void;
        authenticateQuarter: (request: FastifyRequest, reply: FastifyReply, done: Function) => void;
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

    fastify.decorate('masterkey', function (request: FastifyRequest, reply: FastifyReply, done: Function) {
        const key = request.headers.master || request.headers.Master;
        if (process.env.MASTER_KEY && key !== process.env.MASTER_KEY) {
            reply.code(400).send({ error: 'invalid key', key });
        } else done();
    });

    fastify.decorate('authenticate', function (request: FastifyRequest, reply: FastifyReply, done: Function) {
        request
            .jwtVerify()
            .then(() => done())
            .catch(e => {
                reply.code(400).send({ error: e.message });
            });
    });

    // 인증 처리 시도 - 사용자 인증 정보가 있는 경우에 시도함.
    fastify.decorate('authenticateQuarter', function (request: FastifyRequest, reply: FastifyReply, done: Function) {
        if (request.headers.hasOwnProperty('Authorization') || request.headers.hasOwnProperty('authorization')) {
            request
                .jwtVerify()
                .then(() => done())
                .catch(e => {
                    reply.code(400).send({ error: e.message });
                });
        } else done();
    });
});
