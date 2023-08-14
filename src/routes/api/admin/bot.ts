import { FastifyInstance, FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { InteractionResponseType } from 'discord-interactions';
import { APIInteraction, InteractionType } from 'discord-api-types/v10';

import { InteractionEvent } from 'plugins/discord';

import message from 'interactions/message';
import model from 'interactions/model';
import autocomp from 'interactions/autocomp';
import app from 'interactions/app';

export default async (fastify: FastifyInstance, opts: any) => {
    // const message = require('interactions/message').default;
    // const model = require('interactions/model').default;
    // const autocomp = require('interactions/autocomp').default;
    // const app = require('interactions/app').default;

    fastify.post<{
        Body: APIInteraction;
    }>(
        '/bot',
        {
            schema: {
                description: '봇 인터렉션 이벤트 수신부 - 연결 및 사용 X',
                summary: '인터렉션 이벤트',
                tags: ['Admin'],
                deprecated: false,
            },
        },
        (req, res) => {
            const { body } = req;
            if (!fastify.verifyKey(req)) {
                // 승인되지 않음
                return res.status(401).send('Bad request signature');
            }

            // 상태체크 처리
            if (body.type === InteractionType.Ping) {
                console.log('ping');
                return res.status(200).send({ type: InteractionResponseType.PONG });
            }

            // 자동완성처리
            if (body.type === InteractionType.ApplicationCommandAutocomplete) {
                console.log('autocomp');
                return autocomp(body, res);
                // return res.status(200).send({ type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT });
            }

            // 응답이 유동적인 처리를 해야함.
            const interactionEvent: InteractionEvent = {
                re: req.createReply(req, res),
                model: req.createModel(req, res),
                deffer: req.createDeferred(req, res),
                follow: req.createFollowup(req, res),
                raw: { body: body, res: res },
            };

            switch (body.type) {
                case InteractionType.ApplicationCommand:
                    app(Object.assign(body, interactionEvent, body.data));
                    break;
                case InteractionType.MessageComponent:
                    message(Object.assign(body, interactionEvent, body.data));
                    break;
                case InteractionType.ModalSubmit:
                    model(Object.assign(body, interactionEvent, body.data));
                    break;
                default:
                    break;
            }
        }
    );
};
