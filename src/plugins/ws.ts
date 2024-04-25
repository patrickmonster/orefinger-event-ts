import { FastifyInstance } from 'fastify';

import ws from '@fastify/websocket';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.register(ws); // install websocket plugin
};
