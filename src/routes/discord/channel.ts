import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import { getComponentList, createComponent, updateComponent, getComponentDtil } from 'controllers/component';
import { ComponentCreate } from 'interfaces/component';

import discord from 'utils/discordApiInstance';

export default async (fastify: FastifyInstance, opts: any) => {
    //
    fastify.get<{
        Params: { channel_id: number };
    }>(
        '/channel/:channel_id',
        {
            schema: {
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
