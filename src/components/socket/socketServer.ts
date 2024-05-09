import { createAdapter } from '@socket.io/redis-adapter';
import { ecsSelect } from 'controllers/log';
import { Redis } from 'ioredis';
import { Server } from 'socket.io';
import { CHAT_EVENT, LIVE_EVENT } from './socketInterface';

const pubClient = new Redis(`${process.env.REDIS_URL}`);
const subClient = pubClient.duplicate();

subClient.subscribe('liveState', 'chat');

const server = new Server(3001);

server.adapter(createAdapter(pubClient, subClient, { key: 'orefinger' }));

export const LIVE_STATE = server.of('/liveState');
export const CHAT = server.of('/chat');
export const ECS = server.of('/ecs');

server.on('connection', client => {
    client.emit('init', {
        id: process.env.ECS_ID,
        revision: process.env.ECS_REVISION,
        family: process.env.ECS_FAMILY,
        pk: process.env.ECS_PK,
    });

    // LiveState
    client
        .on('liveOnline', data => {
            // 현재 ECS 여유로운 서버가 현재 ECS 서버인지 확인합니다.
            const freeServer = ChatState.getECSSpaceId();
            // 본 서버가 부하가 많은 경우, 모든 서버로 방사 합니다.
            if (freeServer == process.env.ECS_ID) {
                server.emit('liveOnline', data);
            } else {
                // ISSU. 각 서버에서 확인하면, 중복으로 실행 되는 경우가 더러 있어, 수정
                LIVE_STATE.serverSideEmit(LIVE_EVENT.online, data, freeServer);
            }
        })
        .on('liveOffline', data => {
            // 현재 서버가 해당 채널을 가지고 있는지 유무 확인이 어렵기 때문에, 모든 서버로 방사합니다.
            LIVE_STATE.serverSideEmit(LIVE_EVENT.offline, data);
        })
        .on('liveChange', data => {
            // 현재 서버가 해당 채널을 가지고 있는지 유무 확인이 어렵기 때문에, 모든 서버로 방사합니다.
            LIVE_STATE.serverSideEmit(LIVE_EVENT.change, data);
        });

    // Chat State
    client
        .on('chatState', data => {
            CHAT.serverSideEmit(CHAT_EVENT.state, data, process.env.ECS_ID);
        })
        .on('chatJoin', data => {
            CHAT.serverSideEmit(CHAT_EVENT.join, data, process.env.ECS_ID);
        })
        .on('chatChange', data => {
            const freeServer = ChatState.getECSSpaceId();
            CHAT.serverSideEmit(CHAT_EVENT.change, data, freeServer);
        })
        .on('chatLeave', data => {
            CHAT.serverSideEmit(CHAT_EVENT.leave, data, process.env.ECS_ID);
        });
});

/**
 * 라이브 상태를 전달합니다.
 */
LIVE_STATE.on('online', (data, freeServer) => {
    // 현재 방사된 데이터가 현재의 서버인지 확인 합니다.
    if (freeServer == process.env.ECS_ID) {
        server.emit(LIVE_EVENT.online, data);
    }
})
    .on('offline', data => {
        server.emit(LIVE_EVENT.offline, data);
    })
    .on('change', data => {
        server.emit(LIVE_EVENT.change, data);
    });

let servers: any[] = [];

ECS.on('new', async ({ id, revision, family, pk }) => {
    console.log('New ECS connected ::', { id, revision, family, pk });
    const list = await ecsSelect(revision);
    // 새로운 버전의 ECS
    if (revision == process.env.ECS_REVISION) {
        serverECS[id] = { count: 0, userCount: 0 };
        servers = list;
    } else {
        // 현재 버전이 오래된 버전임을 확인함
        const target = list.find(item => item.id == id);
        const thisServer = servers.find(item => item.id == process.env.ECS_ID);
        if (!target || !thisServer) return;

        if (target.rownum == thisServer.rownum) {
            // 현재 서버가 가장 오래된 서버인 경우, 이사를 합니다.
            server.emit('move', id);
        }
    }
});

/**
 * 채팅 정보를 전달합니다.
 */
CHAT.on(CHAT_EVENT.state, data => {
    const { count, userCount, id, revision } = data;
    if (revision !== process.env.ECS_REVISION) return;
    serverECS[id] = { count, userCount };
})
    .on(CHAT_EVENT.join, (data, pid) => {
        if (pid == process.env.ECS_ID) return;
        // 외부 서버가 채팅방에 접속한 경우, 현재 서버에 연결된 채널의 연결을 해지합니다 (중복 제거)
        server.emit('leave', data);
    })
    .on(CHAT_EVENT.change, (data, pid) => {
        if (pid != process.env.ECS_ID) return;
        server.emit('online', data);
    });

//////////////////////////////////////////////////////////////////////////

const serverECS: {
    [key: string]: {
        count: number;
        userCount: number;
    };
} = {};

/**
 * ECS 에서 가장 적은 공간을 찾아서 반환합니다.
 * @returns
 */
export const ChatState = {
    getECSSpaceId: () => {
        // ECS 정보를 불러옵니다.
        const list = Object.keys(serverECS).map(key => {
            return {
                id: key,
                ...serverECS[key],
            };
        });
        const target = list.reduce(
            (prev, curr) => {
                if (prev.userCount > curr.userCount) return curr;
                return prev;
            },
            { count: 9999999, userCount: 9999999, id: '' }
        );

        if (target.id != '') return target.id;
        else return process.env.ECS_PK;
    },
    totalECS: () => {
        return Object.keys(serverECS).reduce((prev, curr) => {
            return prev + serverECS[curr].count;
        }, 0);
    },
    totalECSUser: () => {
        return Object.keys(serverECS).reduce((prev, curr) => {
            return prev + serverECS[curr].userCount;
        }, 0);
    },
};

export default server;
