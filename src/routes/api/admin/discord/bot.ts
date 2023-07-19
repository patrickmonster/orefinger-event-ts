import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { InteractionResponseType, InteractionType, verifyKey, verifyKeyMiddleware } from 'discord-interactions';

import { getComponentList, createComponent, updateComponent, getComponentDtil } from 'controllers/component';
import { ComponentCreate } from 'interfaces/component';

import discord from 'utils/discordApiInstance';

export default async (fastify: FastifyInstance, opts: any) => {};
