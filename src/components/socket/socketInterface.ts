// 클라이언트 -> 서버
export const CLIENT_EVENT = {
    liveOn: 'liveOn',
    liveOff: 'liveOff',
    liveStatus: 'liveStatus',

    requestInit: 'requestInit',

    chatJoin: 'chatJoin',
    chatLeave: 'chatLeave',
};

// 서버 -> 클라이언트
export const SERVER_EVENT = {
    chatJoin: 'chatJoin', // 채팅방 입장 명령
    chatLeave: 'chatLeave',
    chatChange: 'chatChange',

    chatReload: 'chatReload',
};

// 서버측 이벤트
export const SERVER_SIDE_EVENT = {};
