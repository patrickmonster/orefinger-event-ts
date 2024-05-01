export type ECSState = 'channels' | 'join' | 'connect' | 'leave';
export type LiveState = 'online' | 'offline' | 'change' | 'move' | '*';

export interface BaseState {
    revision: string;
    id: string;
}

export interface LiveStateMessage {
    targetId?: string;
    noticeId: number;
    hashId: string;
    liveStatus: any;
}

export interface ECSStateMessage {
    count: number;
    userCount: number;
    hash_id?: string;
}
