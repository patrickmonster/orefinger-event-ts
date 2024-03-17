export const CONNECT_KEY = {
    CONNECT: 'connect', // 연결
    CONNECT_RESET: 'connect_reset', // 리부트
    CONNECT_CLOSE: 'connect_close', // 종료

    // 사용자
    USER: 'user',
    USER_UPDATE: 'user_update',
    USER_DELETE: 'user_delete',
    USER_LIST: 'user_list',

    // 라이브
    LIVE: 'live',
    LIVE_UPDATE: 'live_update',
    LIVE_DELETE: 'live_delete',
};

export const ws = {
    [CONNECT_KEY.CONNECT]: () => {
        return {
            message: '',
            code: CONNECT_KEY.CONNECT,
        };
    },
    CONNECT_RESET: () => {
        return {
            message: 'connection reset',
            code: 1,
        };
    },
    CONNECT_CLOSE: () => {
        return {
            message: 'closed',
            code: 1,
        };
    },
};
