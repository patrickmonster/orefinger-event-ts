import { createAdapter } from '@socket.io/redis-adapter';
import { CHAT_EVENT, CLIENT_EVENT, LIVE_EVENT } from 'components/socket/socketInterface';
import { ecsSelect } from 'controllers/log';
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
        .on(CLIENT_EVENT.liveOnline, (data, pid) => {
            const targetId = pid || ChatState.getECSSpaceId();
            if (targetId == process.env.ECS_PK) {
                // 현재 서버에 방송을 합니다.
                server.emit(CLIENT_EVENT.chatJoin, data, process.env.ECS_PK);
            } else {
                // 다른 서버에 방송을 합니다.
                LIVE_STATE.serverSideEmit(LIVE_EVENT.online, data, targetId);
            }
        })
        .on(CLIENT_EVENT.liveOffline, data => {
            LIVE_STATE.serverSideEmit(LIVE_EVENT.offline, data);
        })
        .on(CLIENT_EVENT.liveChange, data => {
            LIVE_STATE.serverSideEmit(LIVE_EVENT.change, data);
        });

    // Chat State
    client
        .on(CLIENT_EVENT.chatState, data => {
            CHAT.serverSideEmit(CHAT_EVENT.state, data, process.env.ECS_PK);
        })
        .on(CLIENT_EVENT.chatConnect, ({ channelId }) => {
            CHAT.serverSideEmit(CHAT_EVENT.join, { channelId }, process.env.ECS_PK);
        });
});

/**
 * 라이브 상태를 전달합니다.
 */
LIVE_STATE.on(LIVE_EVENT.online, (data, freeServer) => {
    // 현재 방사된 데이터가 현재의 서버인지 확인 합니다.
    if (freeServer == process.env.ECS_PK) {
        server.emit(CLIENT_EVENT.chatJoin, data, freeServer);
    }
})
    .on(LIVE_EVENT.offline, ({ noticeId, hashId, liveStatus }) => {
        server.emit(CLIENT_EVENT.chatLeave, hashId);
    })
    .on(LIVE_EVENT.change, data => {
        server.emit(CLIENT_EVENT.chatChange, data);
    });

let servers: any[] = [];

ECS.on('new', async ({ id, revision, family, pk }) => {
    console.log('New ECS connected ::', { id, revision, family, pk });
    const list = await ecsSelect(revision);
    // 새로운 버전의 ECS
    if (revision == process.env.ECS_REVISION) {
        serverECS[pk] = { count: 0, userCount: 0 };
        servers = list;
    } else {
        // 현재 버전이 오래된 버전임을 확인함
        const target = list.find(item => item.idx == pk);
        const thisServer = servers.find(item => item.idx == process.env.ECS_PK);
        if (!target || !thisServer) return;

        if (target.rownum == thisServer.rownum) {
            // 현재 서버가 가장 오래된 서버인 경우, 이사를 합니다.
            server.emit(CLIENT_EVENT.chatMove, pk);
        }
    }
});

// ce66b73c250f43719d7f473a3f387058

/**
 * 채팅 정보를 전달합니다.
 */
CHAT.on(CHAT_EVENT.state, data => {
    const { count, userCount, idx, revision } = data;
    if (revision == process.env.ECS_REVISION) {
        serverECS[idx] = { count, userCount };
    }
})
    .on(CHAT_EVENT.join, ({ channelId }, pid) => {
        if (pid == process.env.ECS_PK) return;
        // 외부 서버가 채팅방에 접속한 경우, 현재 서버에 연결된 채널의 연결을 해지합니다 (중복 제거)
        server.emit(CLIENT_EVENT.chatLeave, { channelId });
    })
    .on(CHAT_EVENT.change, (data, pid) => {
        if (pid != process.env.ECS_PK) return;
        server.emit(CLIENT_EVENT.liveOnline, data);
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
