import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import { Server } from 'socket.io';
// import { io as clientIo } from 'socket.io-client';

const target = process.env.REDIS_URL || 'redis://localhost:6379';

const pubClient = new Redis(`${target}`);
const subClient = pubClient.duplicate();

subClient.subscribe;

Promise.resolve().then(() => {
    const randomArray = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

    const port = randomArray([3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010, 3011, 3012, 3013, 3014, 301]);

    const server = new Server(port);

    server.adapter(
        createAdapter(pubClient, subClient, {
            key: 'ecs',
        })
    );
    // server.socketsJoin('/');

    server.of('/orefinger').serverSideEmit('test-message', 'hello');
    // server.serverSideEmit('test-message', 'hello');
    // server.of('/')

    server.of('/orefinger').on('test-message', data => {
        console.log('test-message', port, data);
    });

    // const client = clientIo(`http://localhost:${port}`);
    // client.on('connect', () => {
    //     client.emit('test-message', 'hello');
    // });
});
