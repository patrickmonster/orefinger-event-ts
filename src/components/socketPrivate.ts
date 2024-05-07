import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import { Server } from 'socket.io';

const pubClient = new Redis(`${process.env.REDIS_URL}`);
const subClient = pubClient.duplicate();

const server = new Server(3001, {
    adapter: createAdapter(pubClient, subClient),
});

const emitMessage = (target: `/${string}`, event: string, data: any) => {
    server.to(target).emit(event, data);
};

/**
 * 소켓 연결
 */
server.on('connection', client => {
    client.join('/ecs');
    client.join('/state');
    client.join('/chzzk');

    client.on('liveState', message => {
        const { state, target, ...data } = message;

        emitMessage(`/${target}`, state, data);
    });

    client.on('chat', message => {
        const { state, target, ...data } = message;

        emitMessage(`/${target}`, state, data);
    });
});

server.on('liveState', message => {
    console.log(message);
});

export default server;
