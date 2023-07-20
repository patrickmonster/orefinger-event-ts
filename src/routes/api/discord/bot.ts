import { FastifyInstance, FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { InteractionResponseType } from 'discord-interactions';

import { getComponentList, createComponent, updateComponent, getComponentDtil } from 'controllers/component';
import { ComponentCreate } from 'interfaces/component';

import discord from 'utils/discordApiInstance';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.post<{}>(
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

            switch (req.interactionType(body)) {
                case 'PING':
                    return res.status(200).send({ type: InteractionResponseType.PONG });
                case 'APPLICATION_COMMAND':
                    break;
                case 'MESSAGE_COMPONENT':
                    return;
                case 'APPLICATION_COMMAND_AUTOCOMPLETE':
                    return;
                case 'MODAL_SUBMIT':
                    return;
                default:
                    return res.status(400).send('Bad request');
            }
        }
    );
};
