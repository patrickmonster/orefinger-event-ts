export enum ChatCmd {
    PING = 0,
    PONG = 10000,
    CONNECT = 100,
    CONNECTED = 10100,
    REQUEST_RECENT_CHAT = 5101,
    RECENT_CHAT = 15101,
    EVENT = 93006,
    CHAT = 93101,
    DONATION = 93102,
    KICK = 94005,
    BLOCK = 94006,
    BLIND = 94008,
    NOTICE = 94010,
    PENALTY = 94015,
    SEND_CHAT = 3101,
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
    userRoleCode: string;
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
export type ChatDonation = ChatBase<ChatDonationExtras, null>;

export interface ChatOption {
    nidAuth?: string;
    nidSession?: string;
}

export interface ChatChannel {
    liveChannelId: string;
    chatChannelId: string;

    isReConnect: boolean;

    uid: string;
    sid?: string;
    pwId: number;
    token: string;

    defaultHeader?: {
        cid: string;
        svcid: string;
        ver: string;
    };
}
