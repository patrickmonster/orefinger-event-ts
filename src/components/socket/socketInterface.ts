export const LIVE_EVENT = {
    online: 'liveOnline',
    offline: 'liveOffline',
    change: 'liveChange',
};

export const ECS_EVENT = {
    new: 'ecsNew',
    state: 'ecsState',
    join: 'ecsJoin',
    leave: 'ecsLeave',
};

export const CHAT_EVENT = {
    join: 'chatJoin',
    leave: 'chatLeave',
    change: 'chatChange',
    reconnect: 'chatReconnect',
    state: 'chatState',

    auth: 'chatAuth',
};

// 클라이언트 이벤트 - 내부전용
export const CLIENT_EVENT = {
    init: 'private-init',

    // 라이브 명령
    liveOnline: 'private-liveOnline',
    liveOffline: 'private-liveOffline',
    liveChange: 'private-liveChange',

    // Chat 명령
    chatJoin: 'private-chatJoin',
    chatLeave: 'private-chatLeave',
    chatChange: 'private-chatChange',
    chatMove: 'private-chatMove', // 채팅방 이동명령
    chatAuth: 'private-chatAuth', // 인증 수정
    chatUpdate: 'private-chatUpdate', // 인증 수정

    // 채팅방 연결/해제
    chatConnect: 'private-chatConnect',
    chatDisconnect: 'private-chatDisconnect',

    // 채팅방 상태
    chatState: 'private-chatState',
};
