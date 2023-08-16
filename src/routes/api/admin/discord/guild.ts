import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import { getMessageList, createMessage, updateMessage } from 'controllers/message';

import discord from 'utils/discordApiInstance';

export default async (fastify: FastifyInstance, opts: any) => {
    //
};
