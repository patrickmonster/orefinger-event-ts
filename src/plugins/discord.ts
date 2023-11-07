'use strict';
// import { InteractionResponseType, verifyKey } from 'discord-interactions';
import { FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import rawBody from 'fastify-raw-body';
import { InteractionResponseType, verifyKey } from 'utils/interaction';

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

/// TYPE def
import {
    APIApplicationCommandAutocompleteInteraction,
    APIApplicationCommandInteraction,
    APICommandAutocompleteInteractionResponseCallbackData,
    APIInteraction,
    APIMessageComponentInteraction,
    APIModalInteractionResponseCallbackData,
    APIModalSubmitInteraction,
    APIWebhook,
    InteractionType,
} from 'discord-api-types/v10';

import { RESTPostAPIChannelMessageJSONBody } from 'discord-api-types/rest/v10';

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
    APIWebhook,
    ApplicationCommandType,
    // 컴포넌트
    ComponentType,
} from 'discord-api-types/v10';

// 비공개 응답
type ephemeral = { ephemeral?: boolean };

export type RESTPostAPIChannelMessage = RESTPostAPIChannelMessageJSONBody & ephemeral;
export type RESTPostAPIChannelMessageParams = RESTPostAPIChannelMessage | string;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// fastify  정의
declare module 'fastify' {
    interface FastifyInstance {
        verifyKey: (request: FastifyRequest) => boolean;
        verifyDiscordKey: (request: FastifyRequest, reply: FastifyReply, done: Function) => void;
        interaction: (req: FastifyRequest<{ Body: APIInteraction }>, res: FastifyReply) => IReply;
    }
}

interface CustomInstance extends AxiosInstance {
    get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
    delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
    post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
}

export interface IReply {
    reply(message: RESTPostAPIChannelMessage): Promise<void>;
    differ(message?: ephemeral): Promise<void>;
    auth(message: APICommandAutocompleteInteractionResponseCallbackData): Promise<void>;
    model(message: APIModalInteractionResponseCallbackData): Promise<void>;
    edit(message: RESTPostAPIChannelMessage): Promise<void>;
    differEdit(message: RESTPostAPIChannelMessage): Promise<void>;
    follow(message: RESTPostAPIChannelMessage): Promise<IReply>;
}

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const discordInteraction: CustomInstance = axios.create({ baseURL: 'https://discord.com/api', headers: { 'Content-Type': 'application/json' } });

discordInteraction.interceptors.response.use(
    ({ data }) => {
        if (process.env.NODE_ENV === 'local2') {
            console.log('================= AXIOS RESPONSE ==================');
            console.log(data);
            console.log('==================================================');
        }
        return data;
    },
    error => {
        if (process.env.NODE_ENV === 'local2') {
            console.error('================= AXIOS RESPONSE ==================');
            console.error(error);
            console.error('==================================================');
        }
        console.error(error.response.data.message);
        return Promise.reject(error);
    }
);

class Reply {
    private req: FastifyRequest<{ Body: APIInteraction }>;
    private res: FastifyReply;
    private isReply: boolean;

    private token: string;
    private application_id: string;
    private type: InteractionType;
    private id: string;

    constructor(
        req: FastifyRequest<{
            Body: APIInteraction;
        }>,
        res: FastifyReply,
        id = '@original'
    ) {
        const {
            body: { token, application_id, message, type },
        } = req;

        req.log.info(`INTERACTION] ${JSON.stringify(req.body)}`);

        this.id = id ?? '@original';
        this.isReply = message?.id ? true : false;
        this.token = token;
        this.application_id = application_id;
        this.type = type;

        this.res = res;
        this.req = req;
    }

    public async get() {
        return await discordInteraction.get(`/webhooks/${this.application_id}/${this.token}/messages/${this.id}`);
    }
    public async remove() {
        return await discordInteraction.delete(`/webhooks/${this.application_id}/${this.token}/messages/${this.id}`);
    }

    /**
     * 메세지를 string으로 받으면 content로 설정
     * object로 받으면 그대로 설정
     *
     * ephemeral = 비공개 메세지
     * @param message
     * @returns
     */
    private appendEmpheral(message: RESTPostAPIChannelMessageParams): RESTPostAPIChannelMessageJSONBody {
        return typeof message === 'string' ? { content: message } : Object.assign(message, message.ephemeral ? { flags: 64 } : {});
    }
    /**
     * 응답
     * @param message
     */
    public async reply(message: RESTPostAPIChannelMessage) {
        // 응답
        if (this.isReply) {
            await discordInteraction.patch(`/webhooks/${this.application_id}/${this.token}/messages/${this.id}`, message).catch(e => {
                console.log('메세지 수정 실패', e.response.data);
            });
        } else {
            this.isReply = true;
            await this.res.code(200).send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: this.appendEmpheral(message),
            });
        }
    }
    /**
     * 선처리 응답
     * @param message
     */
    public async differ(message?: ephemeral) {
        // 선 처리 후 응답
        if (!this.isReply) {
            this.isReply = true;
            await this.res.code(200).send({
                type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
                data: { flags: message?.ephemeral ? 64 : 0 },
            });
        } else console.info('이미 응답 처리된 요청입니다.');
    }
    /**
     * 자동완성 응답
     * @param message
     * @returns
     */
    public async auth(message: APICommandAutocompleteInteractionResponseCallbackData) {
        return await this.res.status(200).send({
            type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
            data: message,
        });
    }
    /**
     * 모달 응답
     * @param message
     * @returns
     */
    public async model(message: APIModalInteractionResponseCallbackData) {
        // 모달 응답
        if (this.type === InteractionType.ModalSubmit)
            return await this.res.status(200).send({
                type: InteractionResponseType.MODAL,
                data: message,
            });
        else return Promise.reject('모달 응답은 모달 이벤트에서만 사용할 수 있습니다.');
    }
    /**
     * 선처리 메세지 수정
     * @param message
     * @returns
     */
    public async edit(message: RESTPostAPIChannelMessage) {
        // 선처리 메세지 수정 ( 인터렉션 전의 이벤트)
        if (this.type === InteractionType.MessageComponent)
            return await this.res.status(200).send({
                type: InteractionResponseType.UPDATE_MESSAGE,
                data: message,
            });
        else return Promise.reject('선처리 메세지 수정은 컴포넌트 이벤트에서만 사용할 수 있습니다.');
    }
    /**
     * 후행 선처리 메세지 수정
     * @param message
     */
    public async differEdit(message: RESTPostAPIChannelMessage) {
        if (this.type === InteractionType.MessageComponent)
            return await this.res.status(200).send({
                type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE,
                data: message,
            });
        else return Promise.reject('선처리 메세지 수정은 컴포넌트 이벤트에서만 사용할 수 있습니다.');
    }
    /**
     * 후행 처리 응답 메세지
     * @param message
     * @returns
     */
    public async follow(message: RESTPostAPIChannelMessage) {
        return await discordInteraction
            .post<APIWebhook>(`/webhooks/${this.application_id}/${this.token}`, this.appendEmpheral(message))
            .then(({ id }) => {
                return new Reply(this.req, this.res, id);
            });
    }
}

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp(async function (fastify, opts) {
    fastify.register(rawBody, {
        field: 'rawBody',
        encoding: 'utf8', // set it to false to set rawBody as a Buffer **Default utf8**
        runFirst: true, // get the body before any preParsing hook change/uncompress it. **Default false**
    });

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
            const isValidRequest = fastify.verifyKey(request);
            // 인증정보 type 이 1일때만 success가 떨어져서 임의 처리함. (수시로 인증 처리한다고 되어 있음.)
            /**
             * TODO: 추후 인터렉션 이벤트가 변경되면 우선적으로 확인 필요.
             *  -> 현재 PING 일때만 검증 처리되기 때문에 추가 처리가 필요함.
             */
            if (isValidRequest || (body as APIInteraction).type !== InteractionType.Ping) return done();
        }
        return reply.code(401).send('Bad request signature');
    });

    fastify.decorate(
        'interaction',
        (
            req: FastifyRequest<{
                Body: APIInteraction;
            }>,
            res: FastifyReply
        ) => new Reply(req, res)
    );
});
