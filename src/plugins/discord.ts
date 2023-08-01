'use strict';
import fp from 'fastify-plugin';
import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyKey, InteractionResponseType } from 'discord-interactions';

import axios from 'axios';

import {
    APIInteraction,
    RESTPostAPIChannelMessageJSONBody,
    APIModalInteractionResponseCallbackData,
    RESTGetAPIChannelMessageResult,
} from 'discord-api-types/v10';

declare module 'fastify' {
    interface FastifyInstance {
        verifyKey: (request: FastifyRequest) => boolean;
    }

    interface FastifyRequest {
        createReply: (req: FastifyRequest<{ Body: APIInteraction }>, res: FastifyReply) => Reply;
        createDeferred: (req: FastifyRequest<{ Body: APIInteraction }>, res: FastifyReply) => ReplyDeferred;
        createModel: (req: FastifyRequest<{ Body: APIInteraction }>, res: FastifyReply) => ReplyModal;
        createFollowup: (req: FastifyRequest<{ Body: APIInteraction }>, res: FastifyReply) => ReplyFollowup;
    }
}

export type Reply = (message: RESTPostAPIChannelMessageJSONBody | string) => Promise<void>;
export type ReplyDeferred = (message: { ephemeral: boolean }) => Promise<Deferred>;
export type ReplyModal = (message: APIModalInteractionResponseCallbackData) => Promise<void>;
export type ReplyFollowup = (message: RESTPostAPIChannelMessageJSONBody | string) => Promise<RESTGetAPIChannelMessageResult>;

// 선처리 후 응답
export type Deferred = (message: RESTPostAPIChannelMessageJSONBody | string) => Promise<void>;

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp(async function (fastify, opts) {
    const discordInteraction = axios.create({
        baseURL: 'https://discord.com/api',
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
        ): Reply => {
            // console.log(body);
            const { body } = req;
            const { token, application_id, message } = body;
            const id = message ? message.id : '@original';

            let fetchReply = false; // 초기값 설정

            return async (message: (RESTPostAPIChannelMessageJSONBody & { ephemeral: boolean }) | string) => {
                // string -> object
                // CHANNEL_MESSAGE_WITH_SOURCE = 메세지 전송
                // DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
                // DEFERRED_UPDATE_MESSAGE
                // UPDATE_MESSAGE = 메세지 수정

                // 응답 메세지 분기
                try {
                    if (fetchReply) {
                        await discordInteraction.patch(`/webhooks/${application_id}/${token}/messages/${id}`, message);
                    } else {
                        fetchReply = true;
                        await res.status(200).send({
                            type: fetchReply ? InteractionResponseType.UPDATE_MESSAGE : InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                            data: typeof message === 'string' ? { content: message } : message,
                        });
                        // return await discordInteraction.get(`/webhooks/${application_id}/${token}/messages/@original`);
                    }
                } catch (e) {
                    console.error(e);
                    throw e;
                }
            };
        }
    );

    // deferred
    fastify.decorateRequest(
        'createDeferred',
        (
            req: FastifyRequest<{
                Body: APIInteraction;
            }>,
            res: FastifyReply
        ): ReplyDeferred => {
            const {
                body: { token, application_id, message },
            } = req;

            const id = message ? message.id : '@original';

            let isDeferred = false;

            return async () => {
                if (!isDeferred) {
                    isDeferred = true;
                    await res.status(200).send({
                        type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE,
                    });
                }
                return async (message: (RESTPostAPIChannelMessageJSONBody & { ephemeral: boolean }) | string) =>
                    await discordInteraction.patch(
                        `/webhooks/${application_id}/${token}/messages/${id}`,
                        typeof message === 'string' ? { content: message } : message
                    );
            };
        }
    );

    // 후행 응답
    fastify.decorateRequest(
        'createFollowup',
        (
            req: FastifyRequest<{
                Body: APIInteraction;
            }>,
            res: FastifyReply
        ): ReplyFollowup => {
            const {
                body: { token, application_id },
            } = req;

            return async (message: (RESTPostAPIChannelMessageJSONBody & { ephemeral: boolean }) | string) =>
                await discordInteraction.post(`/webhooks/${application_id}/${token}`, typeof message === 'string' ? { content: message } : message);
        }
    );

    // 모달응답
    fastify.decorateRequest(
        'createModel',
        (
            req: FastifyRequest<{
                Body: APIInteraction;
            }>,
            res: FastifyReply
        ): ReplyModal => {
            return async (message: APIModalInteractionResponseCallbackData) => {
                await res.status(200).send({
                    type: InteractionResponseType.MODAL,
                    data: message,
                });
            };
        }
    );
});
