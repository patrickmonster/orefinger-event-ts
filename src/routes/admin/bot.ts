import { APIInteraction, InteractionType } from 'discord-api-types/v10';
import { InteractionResponseType } from 'discord-interactions';
import { FastifyInstance } from 'fastify';

// import app from 'interactions/app';
// import autocomp from 'interactions/autocomp';
// import message from 'interactions/message';
// import model from 'interactions/model';
import { InteractionEvent } from 'plugins/discord';

export default async (fastify: FastifyInstance, opts: any) => {
    let app: any = null;
    let message: any = null;
    let model: any = null;
    let autocomp: any = null;

    fastify.server.on('listening', () => {
        console.log('onListen');

        // app = require('interactions/app').default;
        // autocomp = require('interactions/autocomp').default;
        // message = require('interactions/message').default;
        // model = require('interactions/model').default;
    });

    fastify.post<{
        Body: APIInteraction;
    }>(
        '',
        {
            preHandler: [fastify.verifyDiscordKey],
            schema: {
                // hide: true,
                description: '봇 인터렉션 이벤트 수신부 - 연결 및 사용 X',
                summary: '인터렉션 이벤트',
                tags: ['Admin'],
                deprecated: false,
            },
        },
        (req, res) => {
            const { body } = req;
            console.log('처리');

            // if (!fastify.verifyKey(req)) {
            //     // 승인되지 않음
            //     return res.status(401).send('인증 할 수 없습니다.');
            // }

            // 상태체크 처리
            if (body.type === InteractionType.Ping) {
                console.log('ping');
                return res.status(200).send({ type: InteractionResponseType.PONG });
            }

            // 자동완성처리
            // if (body.type === InteractionType.ApplicationCommandAutocomplete) {
            //     console.log('autocomp');
            //     return autocomp(body, res);
            //     // return res.status(200).send({ type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT });
            // }

            // 응답이 유동적인 처리를 해야함.
            const interactionEvent: InteractionEvent = {
                re: req.createReply(req, res),
                model: req.createModel(req, res),
                deffer: req.createDeferred(req, res),
                follow: req.createFollowup(req, res),
                raw: { body: body, res: res },
            };

            console.log('interactionEvent', interactionEvent);

            // switch (body.type) {
            //     case InteractionType.ApplicationCommand:
            //         app && app(Object.assign(body, interactionEvent, body.data));
            //         break;
            //     case InteractionType.MessageComponent:
            //         message && message(Object.assign(body, interactionEvent, body.data));
            //         break;
            //     case InteractionType.ModalSubmit:
            //         model && model(Object.assign(body, interactionEvent, body.data));
            //         break;
            //     default:
            //         break;
            // }
        }
    );
};

export const autoPrefix = '/bot';
