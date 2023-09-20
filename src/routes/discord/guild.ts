import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import { getComponentList, createComponent, updateComponent, getComponentDtil } from 'controllers/component';
import { ComponentCreate } from 'interfaces/component';

import discord, { getToken, openApi } from 'utils/discordApiInstance';
import { tokens } from 'controllers/auth';
import { getUserToken } from 'components/discordTokne';

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
        async req => {
            const { id } = req.user;
            const access_token = await getUserToken(id);

            return openApi
                .get('/users/@me/guilds?with_counts=true', {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                })
                .then(res => res.data);
        }
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