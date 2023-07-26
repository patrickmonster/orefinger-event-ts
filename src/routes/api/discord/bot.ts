import { FastifyInstance, FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { InteractionResponseType } from 'discord-interactions';
import { APIInteraction, InteractionType } from 'discord-api-types/v10';

import message from 'interactions/message';
import model from 'interactions/model';
import autocomp from 'interactions/autocomp';
import app from 'interactions/app';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.post<{
        Body: APIInteraction;
    }>(
        '/bot',
        {
            schema: {
                description: '봇 인터렉션 이벤트',
                tags: ['Discord'],
                deprecated: false,
            },
        },
        (req, res) => {
            const { body } = req;
            if (!fastify.verifyKey(req)) {
                // 승인되지 않음
                return res.status(401).send('Bad request signature');
            }

            if (body.type === 1) {
                console.log('ping');
                return res.status(200).send({ type: InteractionResponseType.PONG });
            }

            const interactionEvent = {
                re: req.createReply(req, res),
                model: req.createModel(req, res),
                follow: req.createFollowup(req, res),
                raw: {
                    body: body,
                    res: res,
                },
            };

            switch (body.type) {
                case InteractionType.ApplicationCommand:
                    app(Object.assign(body, interactionEvent));
                    break;
                case InteractionType.MessageComponent:
                    message(Object.assign(body, interactionEvent));
                    break;
                case InteractionType.ApplicationCommandAutocomplete:
                    autocomp(Object.assign(body, interactionEvent));
                    break;
                case InteractionType.ModalSubmit:
                    model(Object.assign(body, interactionEvent));
                    break;
                default:
                    break;
            }
        }
    );
};
