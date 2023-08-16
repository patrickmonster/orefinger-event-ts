import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import { getComponentList, createComponent, updateComponent, getComponentDtil } from 'controllers/component';
import { ComponentCreate } from 'interfaces/component';

import discord from 'utils/discordApiInstance';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.get<{}>(
        '/guilds',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
                description: '길드 정보 조회',
                tags: ['Discord'],
                deprecated: false,
            },
        },
        async req => await discord.get(`/users/@me/guilds`)
    );

    fastify.get<{
        Params: { user_id: string };
    }>(
        '/user/:user_id',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
                description: '유저 정보 조회',
                tags: ['Discord'],
                deprecated: false,
                params: {
                    type: 'object',
                    properties: {
                        user_id: { type: 'string' },
                    },
                },
            },
        },
        async req => await discord.get(`/users/${req.params.user_id}`)
    );
};
