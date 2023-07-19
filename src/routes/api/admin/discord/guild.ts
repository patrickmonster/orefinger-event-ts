import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import { getMessageList, createMessage, updateMessage } from 'controllers/message';

import discord from 'utils/discordApiInstance';

export default async (fastify: FastifyInstance, opts: any) => {
    //

    fastify.get<{
        Params: {
            guild_id: string;
        };
    }>(
        '/guild/:guild_id',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                tags: ['Admin'],
                summary: '길드 정보',
                description: '길드 정보',
                params: {
                    type: 'object',
                    properties: {
                        guild_id: { type: 'string' },
                    },
                },
            },
        },
        async req => {
            const { guild_id } = req.params;
            return await discord.get(`guilds/${guild_id}`);
        }
    );
};
