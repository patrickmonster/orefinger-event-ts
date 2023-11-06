import { FastifyInstance } from 'fastify';

import discord from 'utils/discordApiInstance';

export default async (fastify: FastifyInstance, opts: any) => {
    //
    fastify.get<{
        Params: { channel_id: number };
    }>(
        '/channel/:channel_id',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '채널 정보 조회 \n- https://discord.com/developers/docs/resources/channel#get-channel',
                tags: ['Admin'],
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

    fastify.get<{
        Params: { guild_id: string };
    }>(
        '/guild/:guild_id',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description:
                    '길드 정보 조회 \n - https://discord.com/developers/docs/resources/guild#get-guild-channels \n - https://discord.com/developers/docs/resources/guild#get-guild',
                tags: ['Admin'],
                deprecated: false,
                params: {
                    type: 'object',
                    properties: {
                        guild_id: { type: 'string' },
                    },
                },
            },
        },
        async req =>
            await Promise.all([
                discord.get(`/guilds/${req.params.guild_id}?with_counts=true`),
                discord.get(`/guilds/${req.params.guild_id}/channels`),
            ]).then(([guild, channels]) => ({ guild, channels }))
    );
};
