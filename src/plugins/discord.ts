'use strict';
// import { InteractionResponseType, verifyKey } from 'discord-interactions';
import { FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import rawBody from 'fastify-raw-body';
import { InteractionResponseType, verifyKey } from 'utils/interaction';

import axios from 'axios';

/// TYPE def
import {
    APIApplicationCommandAutocompleteInteraction,
    APIApplicationCommandInteraction,
    APIInteraction,
    APIMessageComponentInteraction,
    APIModalInteractionResponseCallbackData,
    APIModalSubmitInteraction,
} from 'discord-api-types/v10';

import { RESTGetAPIChannelMessageResult, RESTPostAPIChannelMessageJSONBody } from 'discord-api-types/rest/v10';

export type Interaction =
    | APIApplicationCommandInteraction
    | APIMessageComponentInteraction
    | APIApplicationCommandAutocompleteInteraction
    | APIModalSubmitInteraction;

export {
    APIApplicationCommandAutocompleteInteraction,
    APIApplicationCommandInteraction,
    APIApplicationCommandInteractionData,
    APIChatInputApplicationCommandInteractionData,
    APIMessageComponentInteraction,
    APIMessageComponentInteractionData,
    APIModalSubmission,
    APIModalSubmitInteraction,
    ApplicationCommandType,
    // 컴포넌트
    ComponentType,
} from 'discord-api-types/v10';

// 비공개 응답
type ephemeral = { ephemeral?: boolean };

export type RESTPostAPIChannelMessage = RESTPostAPIChannelMessageJSONBody & ephemeral;
export type RESTPostAPIChannelMessageParams = RESTPostAPIChannelMessage | string;

type Reply = (message: RESTPostAPIChannelMessage) => Promise<void>;
type ReplyDeferred = (message?: ephemeral) => Promise<Deferred>;
type ReplyModal = (message: APIModalInteractionResponseCallbackData) => Promise<void>;
type ReplyFollowup = (message: RESTPostAPIChannelMessage) => Promise<RESTGetAPIChannelMessageResult>;

// 선처리 후 응답
export type Deferred = (message: RESTPostAPIChannelMessage) => Promise<void>;

export type InteractionEvent = {
    raw: {
        body: APIInteraction;
        res: FastifyReply;
    };
    re: Reply;
    deffer: ReplyDeferred;
    model: ReplyModal;
    follow: ReplyFollowup;
};

// fastify  정의
declare module 'fastify' {
    interface FastifyInstance {
        verifyKey: (request: FastifyRequest) => boolean;
        verifyDiscordKey: (request: FastifyRequest, reply: FastifyReply, done: Function) => void;
    }

    interface FastifyRequest {
        createReply: (req: FastifyRequest<{ Body: APIInteraction }>, res: FastifyReply) => Reply;
        createFollowup: (req: FastifyRequest<{ Body: APIInteraction }>, res: FastifyReply) => ReplyFollowup;
        createDeferred: (req: FastifyRequest<{ Body: APIInteraction }>, res: FastifyReply) => ReplyDeferred;
        createModel: (req: FastifyRequest<{ Body: APIInteraction }>, res: FastifyReply) => ReplyModal;
    }
}

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

    fastify.register(rawBody, {
        field: 'rawBody', // change the default request.rawBody property name
        global: false, // add the rawBody to every request. **Default true**
        encoding: 'utf8', // set it to false to set rawBody as a Buffer **Default utf8**
        runFirst: true, // get the body before any preParsing hook change/uncompress it. **Default false**
        routes: [], // array of routes, **`global`** will be ignored, wildcard routes not supported
    });

    // const isValidRequest = verifyKey(JSON.stringify(body), headers['x-signature-ed25519'], headers['x-signature-timestamp'], process.env.DISCORD_PUBLIC_KEY);
    // if (!isValidRequest) {
    //     res.code(401).send('Bad request signatureOK');
    //     return;
    // }

    fastify.decorate('verifyKey', ({ body, headers, rawBody }) =>
        verifyKey(
            rawBody || JSON.stringify(body),
            `${headers['x-signature-ed25519'] || headers['X-Signature-Ed25519']}`,
            `${headers['x-signature-timestamp'] || headers['X-Signature-Timestamp']}`,
            `${process.env.DISCORD_PUBLIC_KEY}`
        )
    );

    // 인증 처리 시도 - 사용자 인증 정보가 있는 경우에 시도함.
    fastify.decorate('verifyDiscordKey', (request: FastifyRequest, reply: FastifyReply, done: Function) => {
        const { body, headers, method } = request;
        if (method === 'POST') {
            console.log('인증 시도', request);
            const isValidRequest = verifyKey(
                JSON.stringify(body),
                `${headers['x-signature-ed25519'] || headers['X-Signature-Ed25519']}`,
                `${headers['x-signature-timestamp'] || headers['X-Signature-Timestamp']}`,
                `${process.env.DISCORD_PUBLIC_KEY}`
            );
            if (isValidRequest) return done();
        }
        return reply.code(401).send('Bad request signature');
    });

    /**
     * 메세지를 string으로 받으면 content로 설정
     * object로 받으면 그대로 설정
     *
     * ephemeral = 비공개 메세지
     * @param message
     * @returns
     */
    const appendEmpheral = (message: RESTPostAPIChannelMessageParams): RESTPostAPIChannelMessageJSONBody => {
        if (typeof message === 'string')
            return {
                content: message,
            };
        else {
            return {
                ...message,
                flags: 64,
            };
        }
    };

    fastify.decorateRequest('api', discordInteraction);

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

            return async (message: RESTPostAPIChannelMessage) => {
                // string -> object
                // CHANNEL_MESSAGE_WITH_SOURCE = 메세지 전송
                // DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
                // DEFERRED_UPDATE_MESSAGE
                // UPDATE_MESSAGE = 메세지 수정

                console.log('응답 메세지', message, fetchReply);

                // 응답 메세지 분기
                try {
                    if (fetchReply) {
                        await discordInteraction.patch(`/webhooks/${application_id}/${token}/messages/${id}`, message).catch(e => {
                            console.log('메세지 수정 실패', e.response.data);
                        });
                    } else {
                        fetchReply = true;
                        await res.code(200).send({
                            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                            data: appendEmpheral(message),
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
            let isDeferred = false;

            return async (message?: ephemeral) => {
                console.log('deferred', message);
                if (!isDeferred) {
                    isDeferred = true;
                    await res.code(200).send({
                        type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
                        data: { flags: message?.ephemeral ? 64 : 0 },
                    });
                }
                return async (message: RESTPostAPIChannelMessage) =>
                    await discordInteraction.patch(`/webhooks/${application_id}/${token}/messages/@original`, appendEmpheral(message));
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

            return async (message: RESTPostAPIChannelMessage) =>
                await discordInteraction.post(`/webhooks/${application_id}/${token}`, appendEmpheral(message));
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
