import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import { Server } from 'socket.io';
import { getFreeChatServer } from 'utils/redis';
import { CLIENT_EVENT, SERVER_EVENT, SERVER_SIDE_EVENT } from './socketInterface';

const pubClient = new Redis(`${process.env.REDIS_URL}`);
const subClient = pubClient.duplicate();

const server = new Server(3001);

server.adapter(createAdapter(pubClient, subClient, { key: 'orefinger' }));

// 서버 이전이 확정된 경우, 이전할 PK를 저장합니다.
let lastPK = 0;

server.on('connection', socketClient => {
    // 개별 클라이언트 에서 오는 요청들
    socketClient.on('init', () => {
        socketClient.emit('init', {
            id: process.env.ECS_ID,
            revision: process.env.ECS_REVISION,
            family: process.env.ECS_FAMILY,
            pk: process.env.ECS_PK,
        });
    });

    socketClient
        .on(CLIENT_EVENT.liveOn, async noticeId => {
            serverEmit('chatJoin', noticeId, await getFreeChatServer());
        })
        .on(CLIENT_EVENT.liveOff, async noticeId => {
            serverEmit('chatLeave', noticeId);
        })
        .on(CLIENT_EVENT.liveStatus, async noticeId => {
            serverEmit('chatChange', noticeId);
        });

    socketClient.on('echo', (eventname, pid) => {
        server.serverSideEmit('echo', eventname, pid);
    });

    server.serverSideEmit('echo', 'client', process.env.ECS_PK);
});

export const serverEmit = (event: keyof typeof SERVER_EVENT, ...args: any[]) => {
    server.emit(event, ...args);
    server.serverSideEmit('echo', event, process.env.ECS_PK);
};

export const serverSideEmit = (event: keyof typeof SERVER_SIDE_EVENT, ...args: any[]) => {
    server.serverSideEmit(event, ...args);
    server.serverSideEmit('echo', event, process.env.ECS_PK);
};

export const addEvent = (event: keyof typeof SERVER_SIDE_EVENT, callback: (...args: any[]) => void) => {
    server.on(event, callback);
    server.serverSideEmit('echo', 'ADD', event, process.env.ECS_PK);
};

export const close = () => {
    server.close();
};

//////////////////////////////////////////////////////////////////////////
