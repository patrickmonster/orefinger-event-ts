'use strict';
import fp from 'fastify-plugin';
import crypto from 'crypto';
import { FastifyRequest, FastifyReply } from 'fastify';
import { InteractionType, verifyKey } from 'discord-interactions';

declare module 'fastify' {
    interface FastifyInstance {
        verifyKey: (request: FastifyRequest) => boolean;
    }

    interface FastifyRequest {
        interactionType: (body: any) => string;
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

    fastify.decorateRequest('interactionType', (body: any) => {
        switch (body.type) {
            case InteractionType.PING:
                return 'PING';
            case InteractionType.APPLICATION_COMMAND:
                return 'APPLICATION_COMMAND';
            case InteractionType.MESSAGE_COMPONENT:
                return 'MESSAGE_COMPONENT';
            case InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE:
                return 'APPLICATION_COMMAND_AUTOCOMPLETE';
            case InteractionType.MODAL_SUBMIT:
                return 'MODAL_SUBMIT';
            default:
                return 'UNKNOWN';
        }
    });
});
