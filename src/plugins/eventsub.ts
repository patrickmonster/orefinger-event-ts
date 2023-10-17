'use strict';
import crypto from 'crypto';
import { FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
    interface FastifyInstance {
        verifyTwitchEventSub: (request: FastifyRequest, reply: FastifyReply) => boolean;
    }
}

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp(async function (fastify, opts) {
    //
    const SECRET = `${process.env.TWITCH_EVENTSUB_SECRET || '12345678901234567890'}`;

    fastify.decorate('verifyTwitchEventSub', function (request: FastifyRequest, reply: FastifyReply) {
        const { body, headers } = request;
        if (headers.hasOwnProperty('twitch-eventsub-message-signature')) {
            const id = `${headers['twitch-eventsub-message-id']}`;
            const timestamp = `${headers['twitch-eventsub-message-timestamp']}`;
            const [hash, secret_value] = `${headers['twitch-eventsub-message-signature']}`.split('=');

            const computedSignature = crypto
                .createHmac(hash, SECRET)
                .update(id + timestamp + JSON.stringify(body))
                .digest('hex');

            if (secret_value == computedSignature) return true;
        }
        reply.code(401).send('Unauthorized request to EventSub webhook');

        return false;
    });
});
