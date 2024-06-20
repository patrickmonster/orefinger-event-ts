import { createAdapter } from '@socket.io/redis-adapter';
import { ecsRevisionList } from 'controllers/log';
import { Redis } from 'ioredis';
import { Server } from 'socket.io';
import { ParseInt } from 'utils/object';
import { getFreeChatServer } from 'utils/redis';
import { CLIENT_EVENT, SERVER_EVENT, SERVER_SIDE_EVENT } from './socketInterface';

const pubClient = new Redis(`${process.env.REDIS_URL}`);
const subClient = pubClient.duplicate();

const server = new Server(3001);

server.adapter(createAdapter(pubClient, subClient, { key: 'orefinger' }));

// 서버 이전이 확정된 경우, 이전할 PK를 저장합니다.
let isMoveServer = false;

server
    .on('connection', socketClient => {
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

        // 현재 서버에 접속하면 이전 서버에게 나간다는 신호를 보냅니다.
        socketClient
            .on(CLIENT_EVENT.chatJoin, noticeId => {
                serverEmit('chatLeave', noticeId, process.env.ECS_PK);
            })
            .on(CLIENT_EVENT.chatLeave, noticeId => {
                // none
            });

        socketClient.on('echo', (eventname, pid) => {
            server.serverSideEmit('echo', eventname, pid);
        });

        server.serverSideEmit('echo', 'client', process.env.ECS_PK);
    })
    .on(SERVER_SIDE_EVENT.auth, () => {
        serverEmit('auth');
    })
    .on(SERVER_SIDE_EVENT.ADD, async ({ pid, revision }) => {
        // 서버가 추가되었을 때, 이벤트를 받습니다.
        if (isMoveServer) return; // 이동이 확정되었기 때문에 더 이상 이벤트를 받지 않습니다.

        if (process.env.ECS_REVISION && revision !== process.env.ECS_REVISION) {
            // 버전 정보를 불러옴
            const list = await ecsRevisionList(revision, ParseInt(`${process.env.ECS_REVISION}`));
            // 현재 서버와 이전 서버가 동일한 rownum을 가지고 있으면 이사를 합니다.
            const newServer = list.findIndex(item => item.revision == revision);
            const thisServer = list.findIndex(item => item.revision == process.env.ECS_REVISION);

            if (newServer == thisServer) {
                // 현재 서버가 가장 오래된 서버인 경우, 이사를 합니다.
                serverEmit('chatMoveServer', pid, process.env.ECS_PK);
                isMoveServer = true;
            }
        }
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
