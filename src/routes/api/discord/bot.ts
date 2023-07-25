import { FastifyInstance, FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { InteractionResponseType } from 'discord-interactions';
import { APIInteraction } from 'discord-api-types/v10';

import {
    InteractionEvent,
    APIApplicationCommandInteraction,
    APIApplicationCommandAutocompleteInteraction,
    APIModalSubmitInteraction,
    APIMessageComponentInteraction,
} from 'interfaces/interaction';

import message from 'interactions/message';
import model from 'interactions/model';
import autocomp from 'interactions/autocomp';
import app from 'interactions/app';

const getFunction = (type: string) =>
    ({
        2: app,
        3: message,
        4: autocomp,
        5: model,
    }[type]);

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
            const { body, headers } = req;
            if (!fastify.verifyKey(req)) {
                // 승인되지 않음
                return res.status(401).send('Bad request signature');
            }

            if (body.type === 1) {
                console.log('ping');
                return res.status(200).send({ type: InteractionResponseType.PONG });
            }

            console.log('====================================');
            console.log('데이터 수신', body);
            console.log('====================================');
            return getFunction(body.type)({
                ...body,
                re: req.createReply(req, res),
                model: req.createModel(req, res),
                follow: req.createFollowup(req, res),
                raw: {
                    body: body,
                    res: res,
                },
            });
        }
    );
};
