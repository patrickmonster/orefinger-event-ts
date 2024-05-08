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

server.on('connection', client => {
    client.emit('init', {
        id: process.env.ECS_ID,
        revision: process.env.ECS_REVISION,
        family: process.env.ECS_FAMILY,
        pk: process.env.ECS_PK,
    });

    // LiveState
    client
        .on('online', data => {
            // 현재 ECS 여유로운 서버가 현재 ECS 서버인지 확인합니다.
            const freeServer = ChatState.getECSSpaceId();
            if (freeServer == process.env.ECS_ID) {
                server.emit('online', data, freeServer);
            } else {
                // 본 서버가 부하가 많은 경우, 모든 서버로 방사 합니다.
                LIVE_STATE.serverSideEmit('online', data);
            }
        })
        .on('offline', data => {
            // 현재 서바가 해당 채널을 가지고 있는지 유무 확인이 어렵기 때문에, 모든 서버로 방사합니다.
            LIVE_STATE.serverSideEmit('offline', data);
        })
        .on('change', data => {
            // 현재 서바가 해당 채널을 가지고 있는지 유무 확인이 어렵기 때문에, 모든 서버로 방사합니다.
            LIVE_STATE.serverSideEmit('change', data);
        });

    // ECS State
    client
        .on('state', data => {
            CHAT.serverSideEmit('state', data);
        })
        .on('join', data => {
            CHAT.serverSideEmit('join', data, process.env.ECS_ID);
        });
    // ECS
});

/**
 * 라이브 상태를 전달합니다.
 */
LIVE_STATE.on('online', (data, freeServer) => {
    // 현재 방사된 데이터가 현재의 서버인지 확인 합니다.
    if (freeServer == process.env.ECS_ID) {
        server.emit('online', data);
    }
})
    .on('offline', data => {
        server.emit('offline', data);
    })
    .on('change', data => {
        server.emit('change', data);
    });

ECS.on('new', client => {
    console.log('new ECS connected');
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
CHAT.on('state', data => {
    const { count, userCount, id, revision } = data;
    if (revision !== process.env.ECS_REVISION) return;
    serverECS[id] = { count, userCount };
}).on('join', (data, pid) => {
    if (pid == process.env.ECS_ID) return;
    // 외부 서버가 채팅방에 접속한 경우, 현재 서버에 연결된 채널의 연결을 해지합니다 (중복 제거)
    server.emit('leave', data);
});

//////////////////////////////////////////////////////////////////////////

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
