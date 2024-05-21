import ChatServer from 'utils/chat/server';

import client from 'components/socket/socketClient';
import { CLIENT_EVENT } from 'components/socket/socketInterface';
import { authTypes } from 'controllers/auth';
import { createInterval } from 'utils/inteval';
import 'utils/procesTuning';

import chzzkChatMessage from 'components/chatbot/chzzk';
import { saveRedis } from 'utils/redis';

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

server.on('join', channelId => {
    client.emit(CLIENT_EVENT.chatConnect, {
        channelId,
    });
    sendState();
});
server.on('close', channelId => {
    client.emit(CLIENT_EVENT.chatDisconnect, {
        channelId,
    });
    sendState();
});

///////////////////////////////////////////////////////////////////////////////

// 채팅방 입장 명령
client.on(CLIENT_EVENT.chatJoin, (noticeId, freeServer) => {
    if (freeServer == process.env.ECS_PK) {
        server.join(noticeId);
    }
});

// api 에서 수정한 경우 명령어를 다시 불러옵니다
client.on(CLIENT_EVENT.chatUpdate, noticeId => {
    server.reload(noticeId);
});

// 라이브 상태가 변경되었을때
client.on(CLIENT_EVENT.chatChange, (noticeId, freeServer) => {
    if (freeServer == process.env.ECS_PK) {
        server.update(noticeId);
    }
});

// 채팅방 퇴장 명령
client.on(CLIENT_EVENT.chatLeave, noticeId => {
    server.remove(noticeId);
});

// 채팅방 이동 (채팅방 이동시, 채팅방 정보를 전달합니다.)
client.on(CLIENT_EVENT.chatMove, pid => {
    if (!pid) return;
    for (const noticeId of server.noticeIds) {
        client.emit(CLIENT_EVENT.liveOnline, noticeId, pid);
    }
});

/**
 * 채팅 서버 인증
 *  - 세션이 변경된 경우, 원격으로 인증을 수행합니다.
 */
client.on(CLIENT_EVENT.chatAuth, async (nidAuth, nidSession) => {
    server.init(nidAuth, nidSession);

    console.log('SET AUTH', nidAuth, nidSession);

    for (const chatServer of server.serverList) {
        await chatServer.reconnect();
    }
});

const sendState = () => {
    client.emit(CLIENT_EVENT.chatState, {
        ...server.serverState,
        idx: process.env.ECS_PK,
        revision: process.env.ECS_REVISION,
    });

    for (const chatServer of server.serverList) {
        const { chatChannelId } = chatServer;
        const data = server.getState(chatChannelId);

        saveRedis(`CHAT:STATE:${process.env.ECS_PK}:${chatChannelId}`, data, 60 * 60);
    }
};

/**
 * 인증 정보를 불러옵니다.
 */
authTypes(true, 13).then(([type]) => {
    if (!type) return;

    console.log('SET AUTH', type.scope, type.client_sc);

    server.init(type.scope, type.client_sc);
});

createInterval(1000 * 60 * 3, sendState);
