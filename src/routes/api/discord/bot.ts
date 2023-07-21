import { FastifyInstance, FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { InteractionResponseType } from 'discord-interactions';
import { APIInteraction } from 'discord-api-types/v10';

import discord from 'utils/discordApiInstance';

import { InteractionEvent } from 'interfaces/interaction';

import message_component from 'interactions/message_component';

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
            const interaction: InteractionEvent = {
                ...body,
                re: message => {
                    if (typeof message === 'string') message = { content: message };

                    // if ( res.is)
                },
                raw: {
                    body: body,
                    res: res,
                },
            };
            switch (body.type) {
                case 2: // 'APPLICATION_COMMAND'
                    break;
                case 3: // 'MESSAGE_COMPONENT'
                    return message_component(interaction);
                case 4: // 'APPLICATION_COMMAND_AUTOCOMPLETE'
                    return;
                case 5: // 'MODAL_SUBMIT'
                    return;
                default:
                    return res.status(400).send('Bad request');
            }
        }
    );
};
