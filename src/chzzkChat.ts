import ChatServer from 'utils/chat/server';

import { addEvent, clientEmit } from 'components/socket/socketClient';
import { authTypes } from 'controllers/auth';
import { createInterval } from 'utils/inteval';
import 'utils/procesTuning';

import chzzkChatMessage from 'components/chatbot/chzzk';
import { ecsRevisionList } from 'controllers/log';
import { ParseInt } from 'utils/object';
import { cacheRedis, loadRedis, setServerState } from 'utils/redis';

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

// 서버가 준비되었을 경우 최초 1회
server.once('ready', async () => {
    const revision = ParseInt(`${process.env.ECS_REVISION}`) - 1; // 이전버전

    const list = await ecsRevisionList(revision, ParseInt(`${process.env.ECS_REVISION}`));
    // 현재 서버와 이전 서버가 동일한 rownum을 가지고 있으면 이사를 합니다.
    const newServer = list.findIndex(item => ParseInt(item.revision) == revision);
    const thisServer = list.findIndex(item => item.revision == process.env.ECS_REVISION);

    if (newServer == thisServer) {
        const list = await loadRedis<(number | string)[]>(`chat:state:${revision}`);
        if (!list) return;

        for (const id of list) await server.join(`${id}`);
    }
});

/////////////////////////////////////////////////////////////////////
addEvent('chatJoin', (noticeId, pid) => {
    if (process.env.ECS_PK !== pid) return;
    console.log('JOIN SERVER ::', process.env.ECS_PK, noticeId);

    server.join(noticeId);
});

addEvent('chatLeave', (noticeId, pid) => {
    if (pid && pid == process.env.ECS_PK) return;
    server.leave(noticeId);
});

addEvent('chatChange', noticeId => {
    server.change(noticeId);
});

// 인증 정보가 초기화 되었을 경우
addEvent('auth', () => getAuth());

///////////////////////////////////////////////////////////////////////////////

const sendState = () => {
    const { count } = server.serverState;

    const list = [];
    for (const id of server.noticeIds) {
        list.push(id);
    }

    setServerState(count).catch(console.error);
    cacheRedis(`chat:state:${process.env.ECS_PK}`, list, 60 * 60 * 1); // 기록용 ( 외부 확인 )
};

/**
 * 인증 정보를 불러옵니다.
 */
const getAuth = () => {
    authTypes(true, 13).then(([type]) => {
        if (!type) return;

        console.log('SET AUTH', type.scope, type.client_sc);

        server.init(type.scope, type.client_sc);
        if (!process.env.ECS_PK) clientEmit('requestInit');
    });
};

getAuth();

createInterval(1000 * 60 * 3, sendState);
createInterval(1000 * 60 * 60, () => {
    // 1시간마다 서버 상태를 갱신합니다.
    clientEmit('requestInit');
});
