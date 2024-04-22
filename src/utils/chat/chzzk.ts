import WebSocket, { MessageEvent } from 'isomorphic-ws';

/**
 * 채팅을 위한 소캣 입니다.
 */

import EventEmitter from 'events';

const CHZZK_BASE_URL = 'https://api.chzzk.naver.com';
const GAME_BASE_URL = 'https://comm-api.game.naver.com/nng_main';

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

export interface ChatMessage {
    profile: any;
    extras: any;
    hidden: boolean;
    message: any;
    time: any;
    isRecent: boolean;
    memberCount?: any;
}

interface ChatOption {
    liveChannelId: string;
    nidAuth?: string;
    nidSession?: string;
}

export type ChzzkWebSocketType = typeof ChzzkWebSocket;
export default class ChzzkWebSocket extends EventEmitter {
    private ws?: WebSocket;
    private options: any;

    private nidAuth?: string;
    private nidSession?: string;

    private defaultHeader = {}; // 통신에 필요한 기본 헤더

    private uid?: string;
    private sid?: string;
    private token?: string;

    private liveChannelId: string = ''; // 라이브 채널 ID
    private chatChannelId: string = ''; // 채팅 채널 ID

    private connected: boolean = false;
    private reconnected: boolean = false;

    private pingTimeoutId?: NodeJS.Timeout;
    private taskIntervalId?: NodeJS.Timeout;

    constructor(options: ChatOption) {
        super();
        this.options = options;
        this.liveChannelId = options.liveChannelId;
        this.nidAuth = options.nidAuth;
        this.nidSession = options.nidSession;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////
    get serverId() {
        return (Math.abs(this.chatChannelId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 9) + 1;
    }

    /**
     * 채팅 채널 ID
     */
    get channelId() {
        return this.chatChannelId;
    }

    get isConnect() {
        return this.connected;
    }
    get isReConnect() {
        return this.reconnected;
    }

    get hasAuth() {
        return this.nidAuth && this.nidSession;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * 소캣을 연결합니다.
     */

    async connect() {
        //
        if (this.isConnect) {
            throw new Error('이미 연결된 상태');
        }

        this.chatChannelId = await this.status()
            .then(status => status?.chatChannelId)
            .catch(() => null);

        if (this.channelId && !this.token) {
            this.uid = this.hasAuth ? await this.user().then(user => user?.userIdHash) : undefined;
            this.token = await this.accessToken().then(token => token.accessToken);
        }

        this.defaultHeader = {
            cid: this.channelId,
            svcid: 'game',
            ver: '2',
        };

        this.ws = new WebSocket(`wss://kr-ss${this.serverId}.chat.naver.com/chat`);
        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onclose = this.onClose.bind(this);
        this.ws.onmessage = this.handelMessage.bind(this);
    }

    async disconnect() {
        if (!this.isConnect) {
            throw new Error('Not connected');
        }

        this.ws?.close();

        this.ws = undefined;
        this.sid = undefined;
        this.connected = false;
    }

    async reconnect() {
        this.reconnected = true;

        await this.disconnect();
        await this.connect();
    }

    private onOpen() {
        this.connected = true;

        this.sendRow({
            bdy: {
                accTkn: this.token,
                auth: this.uid ? 'SEND' : 'READ',
                devType: 2001,
                uid: this.uid,
            },
            cmd: ChatCmd.CONNECT,
            tid: 1,
        });

        if (!this.isReConnect) {
            this.startTask();
        }
    }

    private onClose() {
        if (!this.isReConnect) {
            this.emit('disconnect', this.channelId);
            // this.stopPolling();
            this.chatChannelId = '';
        }

        this.stopPingTimer();

        this.ws = undefined;

        if (this.isConnect) {
            this.disconnect();
        }
    }

    //////////////////////////////////////////////////////////////////////////

    private fetch(pathOrUrl: string, options?: RequestInit): Promise<any> {
        const headers: any = {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            ...(options?.headers || {}),
        };

        if (this.hasAuth) {
            headers.Cookie = `NID_AUT=${this.nidAuth}; NID_SES=${this.nidSession}`;
        }

        if (pathOrUrl.startsWith('/') || !pathOrUrl.startsWith(GAME_BASE_URL)) {
            pathOrUrl = `${CHZZK_BASE_URL}${pathOrUrl}`;
        }

        console.log('REQUEST', pathOrUrl, options);

        return fetch(pathOrUrl, {
            ...options,
            headers,
        }).then(r => r.json());
    }

    async accessToken() {
        const data = await this.fetch(
            `${GAME_BASE_URL}/v1/chats/access-token?channelId=${this.channelId}&chatType=STREAMING`
        );
        return data['content'] ?? null;
    }

    async status() {
        return await this.fetch(`/polling/v2/channels/${this.liveChannelId}/live-status`).then(({ content }) => {
            if (!content) return null;
            const { livePollingStatusJson, ...result } = content;

            return {
                ...result,
                livePollingStatus: JSON.parse(livePollingStatusJson),
            };
        });
    }

    async user() {
        return await this.fetch(`${GAME_BASE_URL}/v1/user/getUserStatus`).then(({ content }) => content);
    }

    /**
     * 최근 채팅을 요청합니다.
     * @param count 최근 채팅 갯수
     */
    requestRecentChat(count: number = 50) {
        if (!this.isConnect) {
            throw new Error('Not connected');
        }

        this.sendRow({
            bdy: { recentMessageCount: count },
            cmd: ChatCmd.REQUEST_RECENT_CHAT,
            sid: this.sid,
            tid: 2,
        });
    }

    sendChat(message: string, emojis: Record<string, string> = {}) {
        if (!this.isConnect) {
            throw new Error('Not connected');
        }

        if (!this.uid) {
            throw new Error('Not logged in');
        }

        const extras = {
            chatType: 'STREAMING',
            emojis,
            osType: 'PC',
            streamingChannelId: this.channelId,
        };

        this.sendRow({
            bdy: {
                extras: JSON.stringify(extras),
                msg: message,
                msgTime: Date.now(),
                msgTypeCode: ChatType.TEXT,
            },
            retry: false,
            cmd: ChatCmd.SEND_CHAT,
            sid: this.sid,
            tid: 3,
        });
    }

    private async handelMessage(event: MessageEvent) {
        const json = JSON.parse(event.data as string);
        const body = json['bdy'];
        this.emit('raw', json);

        if (!body) {
            console.log('NO BODY', json);
            return;
        }

        switch (json.cmd) {
            case ChatCmd.CONNECTED: {
                const { sid } = body;
                this.connected = true;
                this.sid = sid;
                if (this.isReConnect) {
                    this.emit('reconnect', this.channelId);
                    this.reconnected = false;
                } else {
                    this.emit('connect', null);
                }
                break;
            }
            case ChatCmd.PING:
                this.ws?.send(
                    JSON.stringify({
                        cmd: ChatCmd.PONG,
                        ver: '2',
                    })
                );
                break;
            case ChatCmd.CHAT:
            case ChatCmd.RECENT_CHAT:
            case ChatCmd.DONATION:
                const isRecent = json.cmd == ChatCmd.RECENT_CHAT;
                const chats = body['messageList'] || body;
                const notice = body['notice'];
                if (notice) {
                    this.emit('notice', this.parseChat(notice, isRecent));
                }

                for (const chat of chats) {
                    const type = chat['msgTypeCode'] || chat['messageTypeCode'] || '';
                    const parsed = this.parseChat(chat, isRecent);

                    switch (type) {
                        case ChatType.TEXT:
                            this.emit('chat', parsed);
                            break;
                        case ChatType.DONATION:
                            this.emit('donation', parsed);
                            break;
                        case ChatType.SUBSCRIPTION:
                            this.emit('subscription', parsed);
                            break;
                        case ChatType.SYSTEM_MESSAGE:
                            this.emit('systemMessage', parsed);
                            break;
                    }
                }
                break;
            case ChatCmd.NOTICE:
                this.emit('notice', Object.keys(body).length != 0 ? this.parseChat(body) : null);
                break;
            case ChatCmd.BLIND:
                this.emit('blind', body);
        }

        if (json.cmd != ChatCmd.PONG) {
            this.startPingTimer();
        }
    }

    private startPingTimer() {
        this.stopPingTimer();
        this.pingTimeoutId = setTimeout(() => this.sendPing(), 20000);
    }

    private stopPingTimer() {
        if (this.pingTimeoutId) {
            clearTimeout(this.pingTimeoutId);
        }
        this.pingTimeoutId = undefined;
    }

    private sendPing() {
        if (!this.ws) return;
        this.ws.send(
            JSON.stringify({
                cmd: ChatCmd.PING,
                ver: '2',
            })
        );
        this.pingTimeoutId = setTimeout(() => this.sendPing(), 20000);
    }

    private getContentAllias(conent: any, ...alias: string[]) {
        for (const a of alias) {
            if (conent[a]) {
                return conent[a];
            }
        }
        return null;
    }

    private parseChat(chat: any, isRecent: boolean = false): ChatMessage {
        const profile = JSON.parse(chat['profile']);
        const extras = 'extras' in chat ? JSON.parse(chat['extras']) : null;

        const { registerChatProfileJson, targetChatProfileJson, ...params } = extras?.['params'] || {};
        if (registerChatProfileJson && targetChatProfileJson) {
            params.registerChatProfile = JSON.parse(registerChatProfileJson);
            params.targetChatProfile = JSON.parse(targetChatProfileJson);

            extras.params = params;
        }

        const message = this.getContentAllias(chat, 'msg', 'content');
        const memberCount = this.getContentAllias(chat, 'mbrCnt', 'memberCount');
        const time = this.getContentAllias(chat, 'msgTime', 'messageTime');

        const hidden = this.getContentAllias(chat, 'msgStatusType', 'messageStatusType') == 'HIDDEN';

        const parsed: ChatMessage = {
            profile,
            extras,
            hidden,
            message,
            time,
            isRecent,
        };

        if (memberCount) {
            parsed['memberCount'] = memberCount;
        }

        return parsed;
    }

    private sendRow<T extends Object>(data: { bdy?: T; cmd: ChatCmd; tid?: number; sid?: string; retry?: boolean }) {
        const requsetData = { ...data, ...this.defaultHeader };
        console.log('SEND', requsetData);

        if (this.ws) {
            this.ws.send(JSON.stringify(requsetData));
        } else {
            throw new Error('소캣이 연결되지 않았습니다.');
        }
    }

    private startTask() {
        if (this.taskIntervalId) return;
        this.taskIntervalId = setInterval(async () => {
            const chatChannelId = await this.status()
                .then(status => status?.chatChannelId)
                .catch(() => null);

            //  채널 ID 가 변경된 경우
            if (chatChannelId && chatChannelId != this.options.chatChannelId) {
                this.chatChannelId = chatChannelId;

                await this.reconnect();
            }
        }, 1000 * 60 * 5);
    }

    private stopTask() {
        if (this.taskIntervalId) {
            clearInterval(this.taskIntervalId);
        }
        this.taskIntervalId = undefined;
    }
}
