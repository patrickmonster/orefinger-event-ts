'use strict';
import fp from 'fastify-plugin';
import crypto from 'crypto';
import { FastifyRequest, FastifyReply } from 'fastify';
import { InteractionResponseType, InteractionType, verifyKey, verifyKeyMiddleware } from 'discord-interactions';

declare module 'fastify' {
    interface FastifyInstance {
        verifyKey: (request: FastifyRequest, reply: FastifyReply, done: Function) => boolean;
    }
}

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp(async function (fastify, opts) {
    // fastify.decorate(
    //     'verifyKey',
    //     (
    //         req: FastifyRequest<{
    //             Body: any;
    //         }>,
    //         res: FastifyReply,
    //         done: Function
    //     ) => {
    //         const { body, headers } = req;
    //         if (
    //             verifyKey(
    //                 JSON.stringify(body),
    //                 `${headers['x-signature-ed25519']}`,
    //                 `${headers['x-signature-timestamp']}`,
    //                 `${process.env.JWT_SECRET}`
    //             )
    //         ) {
    //             return body.type;
    //         }
    //         return false;
    //     }
    // );
});
