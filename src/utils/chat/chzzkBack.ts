import EventEmitter from 'events';
import { ChatChannel, ChatCmd, ChatMessage, ChatOption, ChatType } from 'interfaces/chzzk/chat';
import WebSocket, { MessageEvent } from 'isomorphic-ws';
import { getContentAllias } from 'utils/object';
import sleep from 'utils/sleep';
/**
 * 채팅을 위한 소캣 입니다.
 */

const CHZZK_BASE_URL = 'https://api.chzzk.naver.com';
const GAME_BASE_URL = 'https://comm-api.game.naver.com/nng_main';

const getServiceId = (channelId: string) =>
    (Math.abs(channelId.split('').reduce((acc, cur) => acc + cur.charCodeAt(0), 0)) % 9) + 1;

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

    async createChannel(
        liveChannelId: string,
        chatChannelId?: string,
        ver = '2',
        svcid = 'game'
    ): Promise<ChatChannel> {
        // 채널 ID가 없는 경우, 채널 ID를 불러옴
        if (!chatChannelId)
            chatChannelId = await this.status(liveChannelId)
                .then(status => status?.chatChannelId)
                .catch(() => null);

        if (!chatChannelId) throw new Error('Chat Channel ID not found');

        const uid = await this.user().then(user => user?.userIdHash);
        const token = await this.accessToken(chatChannelId).then(token => token.accessToken);

        const processId = getServiceId(chatChannelId) & 0x1f;
        const workerId = getServiceId(chatChannelId) & 0xf;
        const pwId = (workerId * 2 ** 5) | processId;

        const profile = {
            liveChannelId,
            chatChannelId,
            uid,
            pwId,
            token,
            isReConnect: false,
            defaultHeader: {
                cid: chatChannelId,
                svcid,
                ver,
            },
        };

        return profile;
    }
}

export default class ChzzkWebSocket extends EventEmitter {
    private ws?: WebSocket;

    private chatCount: number = 0;

    private userList = new Map<string, any>(); // 유저 리스트

    private chatChannels = new Map<string, ChatChannel>();
    private chatCids = new Map<string, string>();

    private connected: boolean = false;

    private pingTimeoutId?: NodeJS.Timeout;
    private taskIntervalId?: NodeJS.Timeout;

    private serverId: number = 1;
    private api: ChzzkAPI;

    private chatUserCount: { [key: string]: number } = {};

    constructor(serverId: number, api?: ChzzkAPI) {
        super();
        this.serverId = serverId;
        if (api) this.api = api;
        else this.api = new ChzzkAPI();
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////

    get isConnect() {
        return this.connected;
    }

    //{"sessionServerList":["kr-ss1.chat.naver.com","kr-ss2.chat.naver.com","kr-ss3.chat.naver.com","kr-ss4.chat.naver.com","kr-ss5.chat.naver.com","kr-ss6.chat.naver.com","kr-ss7.chat.naver.com","kr-ss8.chat.naver.com","kr-ss9.chat.naver.com","kr-ss10.chat.naver.com"],"proxyServerList":["kr-ss1.chat.naver.com","kr-ss2.chat.naver.com","kr-ss3.chat.naver.com","kr-ss4.chat.naver.com","kr-ss5.chat.naver.com","kr-ss6.chat.naver.com","kr-ss7.chat.naver.com","kr-ss8.chat.naver.com","kr-ss9.chat.naver.com","kr-ss10.chat.naver.com"],"expireTime":10800}
    get host() {
        return `wss://kr-ss${this.serverId}.chat.naver.com/chat`;
    }

    get chatSize() {
        return this.chatCount;
    }

    get users() {
        return this.userList;
    }

    get userTotalCount() {
        return Object.values(this.chatUserCount).reduce((acc, cur) => acc + cur, 0);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////

    /**
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
        console.log('CONNECT ::', this.host);
    }

    async disconnect() {
        if (!this.isConnect) {
            return;
        }

        this.ws?.close();

        this.ws = undefined;
        this.connected = false;
    }

    /**
     * 현재 채팅 채널이 변경되면, 채널을 재 접속 합니다.
     */
    async reconnect() {
        await this.disconnect();
        await this.connect();
    }

    private async onOpen() {
        this.connected = true;

        this.emit('ready');

        for (const channel of this.chatChannels.values()) await this.join(channel);
    }

    private onClose() {
        this.stopPingTimer();
        this.ws = undefined;

        if (this.isConnect) this.disconnect();
    }

    //////////////////////////////////////////////////////////////////////////

    private hasConnected() {
        if (!this.isConnect) {
            throw new Error('소캣이 연결되지 않았습니다.');
        }
    }

    //////////////////////////////////////////////////////////////////////////

    private async initJoiin(channel: ChatChannel) {
        const { liveChannelId, token, uid } = channel;
        this.sendRow(liveChannelId, {
            bdy: {
                accTkn: token,
                auth: uid ? 'SEND' : 'READ',
                devType: 2001,
                uid: uid,
            },
            cmd: ChatCmd.CONNECT,
            tid: 1,
        });
    }

    private joinQueue = new Map<string, [Function, Function]>();

    private isInitJoin = false;

    /**
     * 새로운 채널에 연결합니다.
     * @param channel
     * @returns
     */
    async join(channel: ChatChannel | string) {
        if (typeof channel == 'string') channel = await this.api?.createChannel(channel);
        console.log('JOIN', channel.liveChannelId);
        this.chatChannels.set(channel.liveChannelId, channel);
        this.chatCids.set(channel.chatChannelId, channel.liveChannelId);

        if (!this.isInitJoin) {
            this.isInitJoin = true;
            return await this.initJoiin(channel);
        } else
            return new Promise<void>(async (resolve, reject) => {
                this.joinQueue.set(channel.liveChannelId, [resolve, reject]);
                const { liveChannelId, token, uid } = channel;
                this.sendRow(liveChannelId, {
                    bdy: {
                        accTkn: token,
                        auth: uid ? 'SEND' : 'READ',
                        devType: 2001,
                        uid: uid,
                    },
                    retry: true,
                    cmd: ChatCmd.CONNECT,
                    tid: 1,
                });
            });
    }

    async joinAsync(...liveChannelId: string[]) {
        for (const liveChannel of liveChannelId) {
            const channel = await this.api?.createChannel(liveChannel);
            if (channel) await this.join(channel);
            await sleep(1000);
        }
        return this;
    }

    async leave(liveChannelId: string) {
        const channel = this.getChatChannel(liveChannelId);
        if (!channel) {
            throw new Error('Channel not found');
        }

        return this;
    }

    /**
     * 임시 코드 - 채널 정보를 업데이트 합니다.
     *  - 채널이 업데이트 된 경우, 소캣을 새로 연결합니다.
     */
    updateChannel(cid: string, liveChannelId: string) {
        const oldChannel = this.chatChannels.get(liveChannelId);
        if (oldChannel) {
            this.chatChannels.delete(liveChannelId);

            oldChannel.chatChannelId = cid;
            oldChannel.defaultHeader = {
                cid,
                svcid: 'game',
                ver: '2',
            };

            this.chatChannels.set(liveChannelId, oldChannel);
            this.reconnect();
        }

        return this;
    }

    /**
     * 최근 채팅을 요청합니다.
     * @param count 최근 채팅 갯수
     */
    requestRecentChat(liveChannelId: string, count: number = 50) {
        this.hasConnected();
        this.sendRow(
            liveChannelId,
            {
                bdy: { recentMessageCount: count },
                cmd: ChatCmd.REQUEST_RECENT_CHAT,
                tid: 2,
            },
            true
        );
    }

    sendChat(liveChannelId: string, message: string, emojis: Record<string, string> = {}) {
        this.hasConnected();

        const extras = {
            chatType: 'STREAMING',
            emojis,
            osType: 'PC',
            streamingChannelId: liveChannelId,
        };

        this.sendRow(
            liveChannelId,
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
     * 채널 정보를 불러옴
     * @param cid
     * @returns
     */
    private getChatChannel(cid: string) {
        const channelId = this.chatCids.get(cid);

        if (!channelId) return undefined;
        else return this.chatChannels.get(channelId);
    }

    /**
     * 재인증 요청
     * @param liveChannelId
     * @returns
     */
    private async getProfileAsync(liveChannelId: string) {
        if (!this.api) return;
        const uid = await this.api?.user().then(user => user?.userIdHash);
        const token = this.api?.accessToken(liveChannelId).then(token => token?.accessToken);

        this.sendRow(
            liveChannelId,
            {
                bdy: {
                    uid,
                    accTkn: token,
                },
                cmd: ChatCmd.PROFILE_ASYNC,
            },
            true
        );
    }

    /**
     * 연결 업데이트 이벤트
     * @param liveChannelId
     * @returns
     */
    private async updateConnectState(liveChannelId: string) {
        if (!this.api) return;

        this.sendRow(
            liveChannelId,
            {
                bdy: {
                    // TODO: 미구현 (업데이트)
                },
                cmd: ChatCmd.UPDATE_CONN_STATEUS,
            },
            true
        );
    }

    /**
     * 상태 업데이트 이벤트
     * @param liveChannelId
     * @param isJoin
     * @returns
     */
    private async updateState(liveChannelId: string, isJoin: boolean = true) {
        if (!this.api) return;

        this.sendRow(
            liveChannelId,
            {
                bdy: {
                    // TODO: 미구현 (업데이트)
                },
                cmd: isJoin ? ChatCmd.JOIN : ChatCmd.QUIT,
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
                const channel = this.getChatChannel(cid);
                if (channel) {
                    channel.sid = body.sid;
                    const [resolve, reject] = this.joinQueue.get(channel.liveChannelId) || [];
                    if (resolve) {
                        resolve();
                        this.joinQueue.delete(channel.liveChannelId);
                    }
                    // this.requestRecentChat(channel.liveChannelId);
                }
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
                const channel = this.getChatChannel(cid);
                channel && this.leave(channel?.chatChannelId);
                break;
            }
            case ChatCmd.RECONNECT: {
                // 재접속
                if (type == 'RECONNECT') {
                    const channel = this.getChatChannel(cid);
                    if (channel) {
                        channel.isReConnect = true;
                        this.emit('reconnect', channel.liveChannelId);
                    }
                } else if (type == 'SYNC_PROFILE') {
                    // 프로필 정보 동기화
                    this.getProfileAsync(cid);
                }
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
    private getMessageId(time: number, pwId: number) {
        let snowflake = BigInt(time - 1_420_070_400_000) & ((BigInt(1) << BigInt(41)) - BigInt(1)); // 41 bits for timestamp
        snowflake = snowflake << BigInt(22); // shift 22 bits
        snowflake |= BigInt(pwId & ((1 << 10) - 1)) << BigInt(12); // 10 bits for node id
        snowflake |= BigInt(this.chatCount & ((1 << 12) - 1)); // 12 bits for counter

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

    /**
     * 메세지 파서
     * @param chat
     * @param isRecent
     * @returns
     */
    private parseChat(chat: any, isRecent: boolean = false): ChatMessage {
        const { cid } = chat;
        const channel = this.getChatChannel(cid);

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

        const id = isRecent ? '-' : this.getMessageId(time, channel?.pwId || 0); // 메세지 ID 생성 (Snowflake)

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
        liveChannelId: string,
        data: { bdy?: T; cmd: ChatCmd; tid?: number; sid?: string; retry?: boolean },
        isSid: boolean = false
    ) {
        const liveChannel = this.chatChannels.get(liveChannelId);
        if (!liveChannel) {
            throw new Error('Channel not found');
        }
        const requsetData = { ...data, ...liveChannel.defaultHeader };

        if (isSid) requsetData.sid = liveChannel.sid;
        // console.log('SEND', requsetData);

        if (this.ws) {
            this.ws.send(JSON.stringify(requsetData));
        } else {
            throw new Error('소캣이 연결되지 않았습니다.');
        }
    }

    private startTask() {
        if (this.taskIntervalId) return;
        // this.taskIntervalId = setInterval(async () => {
        //     const chatChannelId = await this.status()
        //         .then(status => status?.chatChannelId)
        //         .catch(() => null);

        //     //  채널 ID 가 변경된 경우
        //     if (chatChannelId && chatChannelId != this.channelId) {
        //         this.chatChannelId = chatChannelId;

        //         await this.reconnect();
        //     }
        // }, 1000 * 60 * 5);
    }

    private stopTask() {
        if (this.taskIntervalId) {
            clearInterval(this.taskIntervalId);
        }
        this.taskIntervalId = undefined;
    }
}
