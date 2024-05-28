import ChatServer from 'utils/chat/server';

import { ENV, addEvent, clientEmit } from 'components/socket/socketClient';
import { authTypes } from 'controllers/auth';
import { createInterval } from 'utils/inteval';
import 'utils/procesTuning';

import chzzkChatMessage from 'components/chatbot/chzzk';
import { cacheRedis, setServerState } from 'utils/redis';

/**
 *
 * @description 알림 작업을 수행하는 스레드로써, 각 알림 스캔 작업을 수행합니다.
 */

const server = new ChatServer();
server.on('message', chat => {
    const {
        message,
        extras: { streamingChannelId },
    } = chat;

    const client = server.getServer(streamingChannelId);
    if (!client || !message) return;

    chzzkChatMessage(client, chat);
});

server.on('join', noticeId => {
    clientEmit('chatJoin', noticeId);
    sendState();
});
server.on('close', noticeId => {
    clientEmit('chatLeave', noticeId);
    sendState();
});

addEvent('chatJoin', (noticeId, pid) => {
    if (ENV.ECS_PK !== pid && process.env.ECS_PK !== pid) return;
    console.log('JOIN SERVER ::', ENV, noticeId);

    server.join(noticeId);
});

addEvent('chatLeave', noticeId => {
    server.leave(noticeId);
});

addEvent('chatChange', noticeId => {
    server.change(noticeId);
});

///////////////////////////////////////////////////////////////////////////////

const sendState = () => {
    const { count } = server.serverState;

    const list = [];
    for (const id of server.noticeIds) {
        list.push(id);
    }

    setServerState(count).catch(console.error);
    cacheRedis(`chat:state:${ENV.ECS_PK}`, list, 60 * 60 * 1); // 기록용 ( 외부 확인 )
};

/**
 * 인증 정보를 불러옵니다.
 */
const getAuth = () => {
    authTypes(true, 13).then(([type]) => {
        if (!type) return;

        console.log('SET AUTH', type.scope, type.client_sc);

        server.init(type.scope, type.client_sc);
        if (!ENV.ECS_PK) clientEmit('requestInit');
    });
};

getAuth();

createInterval(1000 * 60 * 3, sendState);
createInterval(1000 * 60 * 60, () => {
    // 1시간마다 서버 상태를 갱신합니다.
    clientEmit('requestInit');
    // getAuth();
});
