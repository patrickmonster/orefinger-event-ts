import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import { getMessageList, createMessage, updateMessage } from 'controllers/message';

import discord from 'utils/discordApiInstance';

import { Paging } from 'interfaces/swagger';
import { MessageCreate } from 'interfaces/message';

export default async (fastify: FastifyInstance, opts: any) => {
    //

    fastify.delete<{
        Params: {
            channel_id: string;
            message_id: string;
        };
    }>(
        '/message/:channel_id/:message_id',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                tags: ['Admin'],
                summary: '메세지 삭제',
                description: '메세지 삭제',
                params: {
                    type: 'object',
                    properties: {
                        channel_id: { type: 'string' },
                        message_id: { type: 'string' },
                    },
                },
            },
        },
        async req => {
            const { channel_id, message_id } = req.params;
            return await discord.delete(`/channels/${channel_id}/messages/${message_id}`);
        }
    );
};
