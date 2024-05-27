import { createAdapter } from '@socket.io/redis-adapter';
import { CHAT_EVENT, CLIENT_EVENT, LIVE_EVENT } from 'components/socket/socketInterface';
import { Redis } from 'ioredis';
import { Server } from 'socket.io';
import { getServerState } from 'utils/redis';

const pubClient = new Redis(`${process.env.REDIS_URL}`);
const subClient = pubClient.duplicate();

subClient.subscribe('liveState', 'chat');

const server = new Server(3001);

server.adapter(
    createAdapter(pubClient, subClient, {
        key: 'orefinger',
    })
);

export const LIVE_STATE = server.of('/liveState');
export const CHAT = server.of('/chat');
export const ECS = server.of('/ecs');

// 서버 이전이 확정된 경우, 이전할 PK를 저장합니다.
let lastPK = 0;

server.on('connection', client => {
    client.on('requestInit', () => {
        client.emit('init', {
            id: process.env.ECS_ID,
            revision: process.env.ECS_REVISION,
            family: process.env.ECS_FAMILY,
            pk: process.env.ECS_PK,
        });
    });

    // LiveState
    client
        .on(CLIENT_EVENT.liveOnline, (noticeId, pid) => {
            const targetId = lastPK || pid || getServerState();
            server.emit(CLIENT_EVENT.chatJoin, noticeId, targetId);
        })
        .on(CLIENT_EVENT.liveOffline, noticeId => {
            // LIVE_STATE.serverSideEmit(LIVE_EVENT.offline, noticeId);
            server.emit(CLIENT_EVENT.chatLeave, noticeId);
        })
        .on(CLIENT_EVENT.liveChange, noticeId => {
            LIVE_STATE.serverSideEmit(LIVE_EVENT.change, noticeId);
        });

    // Chat State
    client
        .on(CLIENT_EVENT.chatState, noticeId => {
            CHAT.serverSideEmit(CHAT_EVENT.state, noticeId, process.env.ECS_PK);
        })
        .on(CLIENT_EVENT.chatConnect, noticeId => {
            // server emit 을 하면 모든 클러스터의 클라이언트가 수신함.
            server.emit(CLIENT_EVENT.chatLeave, noticeId, process.env.ECS_PK);
        });
});

/**
 * 라이브 상태를 전달합니다.
 */
LIVE_STATE.on(LIVE_EVENT.online, (noticeId, freeServer) => {
    // 현재 방사된 데이터가 현재의 서버인지 확인 합니다.
    if (freeServer == process.env.ECS_PK) {
        server.emit(CLIENT_EVENT.chatJoin, noticeId, freeServer);
    }
})
    // .on(LIVE_EVENT.offline, noticeId => {
    //     server.emit(CLIENT_EVENT.chatLeave, noticeId);
    // })
    .on(LIVE_EVENT.change, noticeId => {
        server.emit(CLIENT_EVENT.chatChange, noticeId);
    });

ECS.on('new', async revision => {
    // 현재 버전하고 다르면, 새로운 서버로 이전합니다.
    if (revision != process.env.ECS_REVISION) {
        // const list = await ecsRevisionList(revision);
    }
});

/**
 * 채팅 정보를 전달합니다.
 */
CHAT
    // .on(CHAT_EVENT.state, data => {
    //     const { count, userCount, idx, revision } = data;
    //     if (revision == process.env.ECS_REVISION) {
    //         // serverECS[idx] = { count, userCount };
    //     }
    // })
    .on(CHAT_EVENT.join, (noticeId, pid) => {
        if (pid == process.env.ECS_PK) return;
        // 외부 서버가 채팅방에 접속한 경우, 현재 서버에 연결된 채널의 연결을 해지합니다 (중복 제거)
        server.emit(CLIENT_EVENT.chatLeave, noticeId, pid);
    })
    .on(CHAT_EVENT.change, (noticeId, pid) => {
        if (pid != process.env.ECS_PK) return;
        server.emit(CLIENT_EVENT.liveOnline, noticeId);
    })
    .on(CHAT_EVENT.reload, (noticeId: string) => {
        server.emit(CLIENT_EVENT.chatUpdate, noticeId);
    })
    .on(CHAT_EVENT.auth, ({ nidAuth, nidSession }) => {
        if (!nidAuth || !nidSession) return;
        server.emit(CLIENT_EVENT.chatAuth, nidAuth, nidSession);
    });

//////////////////////////////////////////////////////////////////////////

export default server;
