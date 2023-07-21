'use strict';
import fp from 'fastify-plugin';
import crypto from 'crypto';
import { FastifyRequest, FastifyReply } from 'fastify';
import { InteractionType, verifyKey } from 'discord-interactions';

import { APIInteraction } from 'discord-api-types/v10';

declare module 'fastify' {
    interface FastifyInstance {
        verifyKey: (request: FastifyRequest) => boolean;
    }

    interface FastifyRequest {
        re: (req: FastifyRequest<{ Body: APIInteraction }>) => void;
    }
}

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp(async function (fastify, opts) {
    fastify.decorate('verifyKey', ({ body, headers }) =>
        verifyKey(
            JSON.stringify(body),
            `${headers['x-signature-ed25519'] || headers['X-Signature-Ed25519']}`,
            `${headers['x-signature-timestamp'] || headers['X-Signature-Timestamp']}`,
            `${process.env.JWT_SECRET}`
        )
    );

    // 인터렉션 응답
    fastify.decorateRequest(
        're',
        (
            req: FastifyRequest<{
                Body: APIInteraction;
            }>
        ) => {
            // console.log(body);
        }
    );
});
