import { FastifyInstance } from 'fastify';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.get('/ws', { websocket: true }, (connection, req) => {
        //
    });
};
