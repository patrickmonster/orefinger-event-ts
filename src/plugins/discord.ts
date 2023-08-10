'use strict';
import fp from 'fastify-plugin';
import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyKey, InteractionResponseType } from 'discord-interactions';

import axios from 'axios';

/// TYPE def
import {
    APIInteraction,
    APIApplicationCommandInteraction,
    APIMessageComponentInteraction,
    APIApplicationCommandAutocompleteInteraction,
    APIModalSubmitInteraction,
    APIModalInteractionResponseCallbackData,
} from 'discord-api-types/v10';

import { RESTPostAPIChannelMessageJSONBody, RESTGetAPIChannelMessageResult } from 'discord-api-types/rest/v10';

export type Interaction =
    | APIApplicationCommandInteraction
    | APIMessageComponentInteraction
    | APIApplicationCommandAutocompleteInteraction
    | APIModalSubmitInteraction;

export {
    APIApplicationCommandInteraction,
    APIMessageComponentInteraction,
    APIApplicationCommandAutocompleteInteraction,
    APIModalSubmitInteraction,

    // 컴포넌트
    ComponentType,
    ApplicationCommandType,
    APIMessageComponentInteractionData, // 메세지 처리 (버튼/매뉴등등)
    APIApplicationCommandInteractionData, // 앱 처리
    APIChatInputApplicationCommandInteractionData, // 채팅 입력 슬레시 명령
    APIModalSubmission, // 모달 처리
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

    fastify.decorate('verifyKey', ({ body, headers }) =>
        verifyKey(
            JSON.stringify(body),
            `${headers['x-signature-ed25519'] || headers['X-Signature-Ed25519']}`,
            `${headers['x-signature-timestamp'] || headers['X-Signature-Timestamp']}`,
            `${process.env.JWT_SECRET}`
        )
    );

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
                        await res.status(200).send({
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

            const id = message ? message.id : '@original';
            let isDeferred = false;

            return async (message?: ephemeral) => {
                if (!isDeferred) {
                    isDeferred = true;
                    await res.status(200).send({
                        type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE,
                        data: {
                            flags: message?.ephemeral ? 64 : 0,
                        },
                    });
                }
                return async (message: RESTPostAPIChannelMessage) =>
                    await discordInteraction.patch(`/webhooks/${application_id}/${token}/messages/${id}`, appendEmpheral(message));
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
