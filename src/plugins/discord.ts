'use strict';
import fp from 'fastify-plugin';
import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyKey, InteractionResponseType } from 'discord-interactions';

import axios from 'axios';

import { APIInteraction, RESTPostAPIChannelMessageJSONBody } from 'discord-api-types/v10';

declare module 'fastify' {
    interface FastifyInstance {
        verifyKey: (request: FastifyRequest) => boolean;
    }

    interface FastifyRequest {
        createReply: (req: FastifyRequest<{ Body: APIInteraction }>, res: FastifyReply) => Reply;
    }
}

export type Reply = (message: RESTPostAPIChannelMessageJSONBody | string) => Promise<void>;

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp(async function (fastify, opts) {
    const discordInteraction = axios.create({
        baseURL: 'https://discord.com/api/',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
    });

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
        'createReply',
        (
            req: FastifyRequest<{
                Body: APIInteraction;
            }>,
            res: FastifyReply
        ) => {
            // console.log(body);
            const { body } = req;
            const { token, application_id } = body;

            let isReply = false; // 초기값 설정

            return async (message: RESTPostAPIChannelMessageJSONBody | string) => {
                // if (isReply) return;

                // string -> object
                if (typeof message === 'string') message = { content: message };

                // 응답 메세지 분기
                try {
                    if (isReply) {
                        await discordInteraction.patch(`/webhooks/${application_id}/${token}/messages/@original`, {
                            type: body.hasOwnProperty(`message`)
                                ? InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE
                                : InteractionResponseType.UPDATE_MESSAGE,
                            data: message,
                        });
                    } else {
                        await res.status(200).send(message);
                    }
                } catch (e) {
                    console.error(e);
                    throw e;
                } finally {
                    isReply = true;
                }
            };
        }
    );
});
