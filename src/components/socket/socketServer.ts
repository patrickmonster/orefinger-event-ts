import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import { Server } from 'socket.io';

const pubClient = new Redis(`${process.env.REDIS_URL}`);
const subClient = pubClient.duplicate();

subClient.subscribe('liveState', 'chat');

const server = new Server(3001);

server.adapter(createAdapter(pubClient, subClient, { key: 'orefinger' }));

export const LIVE_STATE = server.of('/liveState');
export const CHAT = server.of('/chat');
export const ECS = server.of('/ecs');

/**
 * 라이브 상태를 전달합니다.
 */
LIVE_STATE.on('connection', client => {
    client
        .on('online', data => {
            LIVE_STATE.serverSideEmit('online', data);
        })
        .on('offline', data => {
            LIVE_STATE.serverSideEmit('offline', data);
        })
        .on('change', data => {
            LIVE_STATE.serverSideEmit('offline', data);
        });
})
    .on('online', data => {
        server.emit('online', data);
    })
    .on('offline', data => {
        server.emit('offline', data);
    })
    .on('change', data => {
        server.emit('change', data);
    });

/**
 * ECS 정보를 전달합니다.
 */
ECS.on('connection', client => {
    client.emit('init', {
        id: process.env.ECS_ID,
        revision: process.env.ECS_REVISION,
        family: process.env.ECS_FAMILY,
        pk: process.env.ECS_PK,
    });
});

const serverECS: {
    [key: string]: {
        count: number;
        userCount: number;
    };
} = {};

/**
 * 채팅 정보를 전달합니다.
 */
CHAT.on('connection', client => {
    client.on('state', data => {
        CHAT.serverSideEmit('state', data);
    });
}).on('state', data => {
    const { count, userCount, id, revision } = data;
    if (revision !== process.env.ECS_REVISION) return;
    serverECS[id] = { count, userCount };
});

export default server;
