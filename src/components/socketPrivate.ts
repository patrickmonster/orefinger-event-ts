import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import { Server } from 'socket.io';

const pubClient = new Redis(`${process.env.REDIS_URL}`);
const subClient = pubClient.duplicate();

const server = new Server(3001, {
    adapter: createAdapter(pubClient, subClient),
});

const emitMessage = (event: string, data: any) => {
    server.emit(event, data);
};

/**
 * 소켓 연결
 */
server.on('connection', client => {
    client.on('liveState', message => {
        const { state, ...data } = message;

        emitMessage(state, data);
    });

    client.on('chat', message => {
        const { state, target, ...data } = message;

        emitMessage(state, data);
    });
});

export default server;
