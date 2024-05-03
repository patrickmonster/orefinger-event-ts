import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import { Server } from 'socket.io';

import PQueue from 'p-queue';

/**
 * Redis Adapter를 사용한 Socket.IO 서버
 * @see https://socket.io/docs/v4/redis-adapter/
 */
const pubClient = new Redis(`${process.env.REDIS_URL}`);
const subClient = pubClient.duplicate();

const queue = new PQueue({ concurrency: 1 });

const io = new Server({
    adapter: createAdapter(pubClient, subClient),
}).on('connection', socket => {
    console.log('connection', socket.id);
});

export default io;

////////////////////////////////////////////////////////////////////////////////////////
