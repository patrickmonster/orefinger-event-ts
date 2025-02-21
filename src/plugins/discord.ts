import { APIInteraction, InteractionType } from 'discord-api-types/v10';
import discord, { Reply } from 'fastify-discord';
import fp from 'fastify-plugin';

// need ts
declare module 'fastify' {
    interface FastifyInstance {
        decorateInteractionReply: (req: FastifyRequest<{ Body: APIInteraction }>, res: FastifyReply) => IReply;
    }
}

export type IReply = Reply<
    | InteractionType.ApplicationCommand
    | InteractionType.ApplicationCommandAutocomplete
    | InteractionType.MessageComponent
    | InteractionType.ModalSubmit
    | InteractionType.Ping
>;

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp(async function (fastify, opts) {
    fastify.register(discord, {
        DISCORD_PUBLIC_KEY: process.env.DISCORD_PUBLIC_KEY || '',
        decorateReply: 'decorateInteractionReply',
    });
});
