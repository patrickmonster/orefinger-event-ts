import EventEmitter from 'events';
import { ChatCmd, ChatMessage, ChatOption, ChatType } from 'interfaces/chzzk/chat';
import WebSocket, { MessageEvent } from 'isomorphic-ws';
import { getContentAllias } from 'utils/object';
/**
 * 채팅을 위한 소캣 입니다.
 */

const CHZZK_BASE_URL = 'https://api.chzzk.naver.com';
const GAME_BASE_URL = 'https://comm-api.game.naver.com/nng_main';

const getServiceId = (channelId: string, maxSize = 9) =>
    (Math.abs(channelId.split('').reduce((acc, cur) => acc + cur.charCodeAt(0), 0)) % maxSize) + 1;

export type ChzzkWebSocketType = typeof ChzzkWebSocket;
export type ChzzkAPIType = typeof ChzzkAPI;

/**
 * 치지직. api - 채팅 서버와 연결합니다. (Naver Streaming Chat)
 */
export class ChzzkAPI {
    private nidAuth?: string;
    private nidSession?: string;

    private userProfile?: any;

    constructor(options?: ChatOption) {
        console.log('API', options);

        this.nidAuth = options?.nidAuth;
        this.nidSession = options?.nidSession;
    }

    get hasAuth() {
        return this.nidAuth && this.nidSession;
    }

    static serverId(chatChannelId: string) {
        return getServiceId(chatChannelId);
    }

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

        console.log('REQUEST', pathOrUrl);

        return fetch(pathOrUrl, {
            ...options,
            headers,
        }).then(r => r.json());
    }

    async accessToken(chatchannelId: string) {
        const data = await this.fetch(
            `${GAME_BASE_URL}/v1/chats/access-token?channelId=${chatchannelId}&chatType=STREAMING`
        );
        return data?.content ?? null;
    }

    async status(liveChannelId: string) {
        return await this.fetch(`/polling/v2/channels/${liveChannelId}/live-status`).then(({ content }) => {
            if (!content) return null;
            const { livePollingStatusJson, ...result } = content;

            return {
                ...result,
                livePollingStatus: JSON.parse(livePollingStatusJson),
            };
        });
    }

    /**
     * 프로필 정보 (유저 정보) - 캐싱
     * @returns
     */
    async user() {
        if (!this.hasAuth) return undefined;
        if (this.userProfile) return this.userProfile;
        return await this.fetch(`${GAME_BASE_URL}/v1/user/getUserStatus`).then(({ content }) => {
            this.userProfile = content;
            return content;
        });
    }
}

interface ChzzkWebSocketOption {
    chatChannelId: string;
    liveChannelId: string;
    token: string;
    uid?: string;
}

/**
 * 필요한 데이터만 구현함.
 */
export default class ChzzkWebSocket extends EventEmitter {
    private option: ChzzkWebSocketOption;
    private ws?: WebSocket;

    private chatCount: number = 0;

    private userList = new Map<string, any>(); // 유저 리스트

    private connected: boolean = false;
    private reconnecting: boolean = false;

    private pingTimeoutId?: NodeJS.Timeout;

    private uid?: string; // 유저 id
    private sid?: string; // 세션 id ( = chatSessionId )
    private token?: string; // 토큰

    // 기본 헤더
    private defaultHeader: {
        cid: string; // 채널 id ( = chatChannelId )
        svcid: string; // 서비스 id;
        ver: string; // 버전
    };

    private chatUserCount: { [key: string]: number } = {};

    constructor(option: ChzzkWebSocketOption) {
        super();
        this.option = option;
        this.token = option.token;
        this.uid = option.uid;

        this.defaultHeader = {
            cid: option.chatChannelId,
            svcid: 'game',
            ver: '2',
        };
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////

    get isConnect() {
        return this.connected;
    }

    get host() {
        return `wss://kr-ss${getServiceId(this.chatChannelId)}.chat.naver.com/chat`;
    }

    get chatSize() {
        return this.chatCount;
    }

    get users() {
        return this.userList.values();
    }

    get userTotalCount() {
        return Object.values(this.chatUserCount).reduce((acc, cur) => acc + cur, 0);
    }

    get chatChannelId() {
        return this.defaultHeader.cid;
    }

    get pwId() {
        const processId = getServiceId(this.chatChannelId || '') & 0x1f;
        const workerId = getServiceId(this.chatChannelId || '') & 0xf;
        return (workerId * 2 ** 5) | processId;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////7
    /**
     * 1.
     * 소캣을 연결합니다.
     */
    async connect() {
        if (this.isConnect) {
            return this;
        }
        this.ws = new WebSocket(this.host);
        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onclose = this.onClose.bind(this);
        this.ws.onmessage = this.handelMessage.bind(this);
        this.reconnecting = false;
    }

    async disconnect() {
        if (!this.isConnect) {
            return;
        }
        this.ws?.close();
    }

    /**
     * 현재 채팅 채널이 변경되면, 채널을 재 접속 합니다.
     */
    async reconnect() {
        this.reconnecting = true;
        await this.disconnect();
        await this.connect();
    }

    private async onOpen() {
        this.connected = true;
        console.log('CONNECT ::', this.host);

        this.sendRow({
            bdy: {
                accTkn: this.token,
                auth: this.uid ? 'SEND' : 'READ',
                devType: 2001,
                uid: this.uid,
            },
            retry: true,
            cmd: ChatCmd.CONNECT,
            tid: 1,
        });

        this.emit('ready');
    }

    private onClose() {
        this.stopPingTimer();
        this.ws = undefined;
        this.connected = false;

        // 재접속이 아닌 경우, close 이벤트 발생
        if (!this.reconnecting) this.emit('close');
    }

    //////////////////////////////////////////////////////////////////////////

    /**
     * 임시 코드 - 채널 정보를 업데이트 합니다.
     *  - 채널이 업데이트 된 경우, 소캣을 새로 연결합니다.
     */
    updateChannel(cid: string) {
        if (this.defaultHeader?.cid == cid) {
            this.defaultHeader = {
                cid,
                svcid: 'game',
                ver: '2',
            };
            this.reconnect();
        }
        return this;
    }

    /**
     * 최근 채팅을 요청합니다.
     * @param count 최근 채팅 갯수
     */
    requestRecentChat(count: number = 50) {
        if (!this.isConnect) return;
        this.sendRow(
            {
                bdy: { recentMessageCount: count },
                cmd: ChatCmd.REQUEST_RECENT_CHAT,
                tid: 2,
            },
            true
        );
    }

    sendChat(message: string, emojis: Record<string, string> = {}) {
        if (!this.isConnect) return;

        const extras = {
            chatType: 'STREAMING',
            emojis,
            osType: 'PC',
            streamingChannelId: this.chatChannelId,
        };

        this.sendRow(
            {
                bdy: {
                    extras: JSON.stringify(extras),
                    msg: message,
                    msgTime: Date.now(),
                    msgTypeCode: ChatType.TEXT,
                },
                retry: false,
                cmd: ChatCmd.SEND_CHAT,
                tid: 3,
            },
            true
        );
    }

    /**
     * 메세지 수신 이벤트
     * @param message 수신 메세지
     */
    private async handelMessage({ data }: MessageEvent) {
        const { bdy: body, cmd, type, cid } = JSON.parse(data as string);
        this.emit('raw', { body, cmd });

        switch (cmd) {
            case ChatCmd.PING: {
                this.ws?.send(
                    JSON.stringify({
                        cmd: ChatCmd.PONG,
                        ver: '2',
                    })
                );
                break;
            }
            case ChatCmd.CONNECTED: {
                // 세션 정보 취득
                this.sid = body.sid;
                console.log('CONNECTED :: ', body.sid);
                break;
            }
            case ChatCmd.CHAT:
            case ChatCmd.RECENT_CHAT:
            case ChatCmd.DONATION: {
                const isRecent = cmd == ChatCmd.RECENT_CHAT;
                const { messageList, notice } = body;
                const chats = messageList || body;
                if (notice) {
                    this.emit('notice', this.parseChat(notice, isRecent));
                }

                for (const chat of chats) {
                    const type = getContentAllias(chat, 'msgTypeCode', 'messageTypeCode') || '';
                    const parsed = this.parseChat(chat, isRecent);

                    switch (type) {
                        case ChatType.TEXT:
                            this.createUserMessage(parsed); // ChatMessage
                            break;
                        case ChatType.DONATION:
                            this.emit('donation', parsed); // ChatDonation
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
            }
            case ChatCmd.NOTICE:
                this.emit('notice', Object.keys(body).length != 0 ? this.parseChat(body) : null);
                break;
            case ChatCmd.BLIND:
                this.emit('blind', body);
                break;
            case ChatCmd.CLOSE_LIVE: {
                // 채널 종료
                break;
            }
        }

        if (cmd != ChatCmd.PONG) {
            this.startPingTimer();
        }
    }

    /**
     * 메세지 ID를 생성합니다.
     * @param time
     * @returns Snowflake
     * @reference https://discord.com/developers/docs/reference#snowflakes
     * @reference https://github.com/lemon-mint/snowflake-id-web-visualisation/blob/main/src/main.ts#L107-L110
     */
    private getMessageId(time: number, userId: string) {
        let snowflake = BigInt(time - 1_420_070_400_000) & ((BigInt(1) << BigInt(41)) - BigInt(1)); // 41 bits for timestamp
        snowflake = snowflake << BigInt(22); // shift 22 bits
        snowflake |= BigInt(getServiceId(userId, 1023) & ((1 << 10) - 1)) << BigInt(12); // 10 bits for node id
        snowflake |= BigInt(getServiceId(this.chatChannelId, 1023) & ((1 << 12) - 1)); // 12 bits for counter

        return snowflake.toString();
    }

    /**
     * 메세지를 보존 및 이벤트를 발생시킵니다.
     * @param chat
     */
    private createUserMessage(chat: ChatMessage) {
        const { profile } = chat;
        const { userIdHash } = profile;

        this.userList.set(userIdHash, profile);
        this.chatCount++;

        this.emit('chat', chat);
    }

    private startPingTimer() {
        this.stopPingTimer();
        this.pingTimeoutId = setTimeout(() => this.sendPing(), 20_000);
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

    /**
     * 메세지 파서
     * @param chat
     * @param isRecent
     * @returns
     */
    private parseChat(chat: any, isRecent: boolean = false): ChatMessage {
        const { cid } = chat;

        const profile = JSON.parse(chat.profile);
        const extras = 'extras' in chat ? JSON.parse(chat.extras) : null;

        const { registerChatProfileJson, targetChatProfileJson, ...params } = extras?.params || {};
        if (registerChatProfileJson && targetChatProfileJson) {
            params.registerChatProfile = JSON.parse(registerChatProfileJson);
            params.targetChatProfile = JSON.parse(targetChatProfileJson);

            extras.params = params;
        }

        const message = getContentAllias(chat, 'msg', 'content');
        const memberCount = getContentAllias(chat, 'mbrCnt', 'memberCount');
        const time = getContentAllias(chat, 'msgTime', 'messageTime');

        const hidden = getContentAllias(chat, 'msgStatusType', 'messageStatusType') == 'HIDDEN';
        const id = profile?.userIdHash ? this.getMessageId(time, profile.userIdHash) : '-'; // 메세지 ID 생성 (Snowflake)

        const parsed: ChatMessage = { profile, extras, hidden, message, time, id, isRecent, cid };
        if (memberCount) {
            parsed.memberCount = memberCount;

            // 채널 인원수 업데이트
            this.chatUserCount[cid] = memberCount;
        }

        return parsed;
    }

    /**
     * 미리 셋팅되는 데이터
     *  cid: string; // 채널 id ( = chatChannelId )
        svcid: string; // 서비스 id;
        ver : string; // 버전 (2)
     * @param liveChannelId 
     * @param data 
     * @param isSid 
     */
    private sendRow<T extends Object>(
        data: { bdy?: T; cmd: ChatCmd; tid?: number; sid?: string; retry?: boolean },
        isSid: boolean = false
    ) {
        const requsetData = { ...data, ...this.defaultHeader };
        if (isSid) requsetData.sid = this.sid;

        if (this.ws) {
            this.ws.send(JSON.stringify(requsetData));
        } else {
            console.error('소캣이 연결되지 않았습니다.', requsetData);
            // throw new Error('소캣이 연결되지 않았습니다.');
        }
    }
}
