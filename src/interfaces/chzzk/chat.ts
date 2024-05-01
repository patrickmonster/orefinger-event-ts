export enum ChatCmd {
    // REQUEST
    PING = 0,
    CONNECT = 100,
    PROFILE_ASYNC = 104, // 프로필 정보 요청 ->

    // COMMANDs
    SEND_CHAT = 3101,

    // JOIN = 4001, // 채널 입장
    // QUIT = 4002, // 채널 퇴장
    JOIN = 94001, // 채널 입장
    QUIT = 94002, // 채널 퇴장

    // 서버측 데이터 요청
    REQUEST_RECENT_CHAT = 5101, // 최근 채팅 요청

    UPDATE_CONN_STATEUS = 9002, // 연결 상태 업데이트 -> ?

    //////////////////////////////////////////////////////////////
    // RESPONSE
    PONG = 10000,
    CONNECTED = 10100, // 연결 성공
    RESPONSE_GET_PROFILE = 10104,
    RECENT_CHAT = 15101,
    // 서버측 수신

    //////////////////////////////////////////////////////////////
    CLOSE = 90102, // server close ( 서버측 연결 해제 )

    //// 3000
    EVENT = 93006,
    CHAT = 93101,
    DONATION = 93102,

    //// 4000
    KICK = 94005,
    BLOCK = 94006,
    BLIND = 94008,
    FORCE_DISCONNECT = 94009, // 서버측 연결 해제
    NOTICE = 94010,
    CLOSE_LIVE = 94102,
    DISABLE_LIVE = 94103,
    PENALTY = 94015,

    // LOUNG_MESSAGE = 3201, // 라운지 메세지
    RECONNECT = 94201, // 재접속
}

export enum ChatType {
    TEXT = 1,
    IMAGE = 2,
    STICKER = 3,
    VIDEO = 4,
    RICH = 5,
    DONATION = 10,
    SUBSCRIPTION = 11,
    SYSTEM_MESSAGE = 30,
}

export interface ChatBase<E, P> {
    profile: P;
    extras: E;
    hidden: boolean;
    message: string;
    time: number;
    isRecent: boolean;
    id: string;
    cid: string;
    memberCount?: number;
}

export interface ChatExtrasBase {
    chatType: string; //  'STREAMING';
    osType: 'PC' | 'AOS' | 'IOS'; // 'PC';
    streamingChannelId: string; // 실제 채널 hashId
    emojis: {}; // ?
}

export interface ChatDonationExtras extends ChatExtrasBase {
    isAnonymous: boolean; // 익명
    payType: string; // CURRENCY
    payAmount: number; // 1000 / 2000 (도네이션)
    donationType: 'CHAT' | any;
    weeklyRankList: {
        userIdHash: string;
        nickName: string;
        verifiedMark: boolean;
        donationAmount: number;
        ranking: number;
    }[];
}

export interface ChatMessageExtras extends ChatExtrasBase {
    extraToken: string;
}

export interface ChatUserProfile {
    userIdHash: string;
    nickname: string;
    profileImageUrl: string;
    // 운영자 / 일반유저 / 채팅관리자
    userRoleCode: 'streamer' | 'common_user' | 'streaming_chat_manager' | 'streaming_channel_manager';
    badge: string;
    title: string;
    verifiedMark: boolean;
    activityBadges: {
        badgeNo: number;
        badgeId: string; // name
        imageUrl: string; // url
        activated: boolean; // 활성화
    }[];
    streamingProperty: {
        subscription: { accumulativeMonth: number; tier: number; badge: [Object] };
    };
}

export type ChatMessage = ChatBase<ChatMessageExtras, ChatUserProfile>;
export type ChatDonation = ChatBase<ChatDonationExtras, ChatUserProfile>;

export interface ChatOption {
    nidAuth?: string;
    nidSession?: string;
}

export interface ChatChannel {
    liveChannelId: string; // 실제 채널 hashId
    chatChannelId: string; // 채팅 채널 id ( = defaultHeader.cid )

    isReConnect: boolean; // 재접속 여부 (재접속시 true)

    uid: string; // 유저 id
    sid?: string; // 세션 id ( = chatSessionId )
    pwId: number; // 프로세서 ID
    token: string; // 토큰

    // 기본 헤더
    defaultHeader?: {
        cid: string; // 채널 id ( = chatChannelId )
        svcid: string; // 서비스 id;
        ver: string; // 버전
    };
}
