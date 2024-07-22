import { getGuild, getGuildInvites } from 'components/discord';
import { FastifyInstance } from 'fastify';

import discord from 'utils/discordApiInstance';

export default async (fastify: FastifyInstance, opts: any) => {
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
                getGuild(req.params.guild_id),
                discord.get(`/guilds/${req.params.guild_id}/channels`),
            ]).then(([guild, channels]) => ({ guild, channels }))
    );

    fastify.get<{
        Params: { guild_id: string };
    }>(
        '/guild/:guild_id/invites',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                description: '길드 초대 조회 \n - https://discord.com/developers/docs/resources/invite',
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
        async req => getGuildInvites(req.params.guild_id)
    );
};
