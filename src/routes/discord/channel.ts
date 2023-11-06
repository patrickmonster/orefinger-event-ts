import { FastifyInstance } from 'fastify';

import discord from 'utils/discordApiInstance';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.get<{
        Params: { guild_id: number };
    }>(
        '/guild/:guild_id/channels',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
                description: '길드 채널 목록 조회',
                tags: ['Discord'],
                deprecated: false,
                params: {
                    type: 'object',
                    properties: {
                        guild_id: { type: 'string' },
                    },
                },
            },
        },
        async req => await discord.get(`/guilds/${req.params.guild_id}/channels`)
    );
    //
    fastify.get<{
        Params: { channel_id: number };
    }>(
        '/channel/:channel_id',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
                description: '채널 정보 조회',
                tags: ['Discord'],
                deprecated: false,
                params: {
                    type: 'object',
                    properties: {
                        channel_id: { type: 'string' },
                    },
                },
            },
        },
        async req => await discord.get(`/channels/${req.params.channel_id}`)
    );
};
