import { FastifyInstance } from 'fastify';

import discord from 'utils/discordApiInstance';

export default async (fastify: FastifyInstance, opts: any) => {
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

    fastify.post<{
        Params: {
            channel_id: string;
        };
        Body: {
            content: string;
            embeds: any[];
            components: any[];
        };
    }>(
        '/message/:channel_id',
        {
            onRequest: [fastify.masterkey],
            schema: {
                security: [{ Master: [] }],
                tags: ['Admin'],
                summary: '메세지 생성',
                description: '메세지 생성',
                params: {
                    type: 'object',
                    properties: {
                        channel_id: { type: 'string' },
                    },
                },
                body: {
                    type: 'object',
                    properties: {
                        content: { type: 'string', nullable: true },
                        tts: { type: 'boolean', nullable: true },
                        embed: { type: 'object', nullable: true },
                        components: { type: 'array', nullable: true },
                    },
                },
            },
        },
        async req => {
            const { channel_id } = req.params;
            const { content, embeds, components } = req.body;

            return await discord
                .post(`/channels/${channel_id}/messages`, {
                    body: {
                        content,
                        embeds,
                        components,
                    },
                })
                .catch(e => {
                    console.log(e.response.data);
                    throw e;
                });
        }
    );
};
