import EventEmitter from 'events';
import { ChatChannel, ChatCmd, ChatMessage, ChatOption, ChatType } from 'interfaces/chzzk/chat';
import WebSocket, { MessageEvent } from 'isomorphic-ws';
/**
 * 채팅을 위한 소캣 입니다.
 */

const CHZZK_BASE_URL = 'https://api.chzzk.naver.com';
const GAME_BASE_URL = 'https://comm-api.game.naver.com/nng_main';

const getServiceId = (channelId: string) =>
    (Math.abs(channelId.split('').reduce((acc, cur) => acc + cur.charCodeAt(0), 0)) % 9) + 1;

export type ChzzkWebSocketType = typeof ChzzkWebSocket;
export type ChzzkAPIType = typeof ChzzkAPI;

export class ChzzkAPI {
    private nidAuth?: string;
    private nidSession?: string;

    private userProfile?: any;

    constructor(options?: ChatOption) {
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

    async user() {
        if (!this.hasAuth) return undefined;

        if (this.userProfile) return this.userProfile;
        return await this.fetch(`${GAME_BASE_URL}/v1/user/getUserStatus`).then(({ content }) => content);
    }

    async createChannel(liveChannelId: string): Promise<ChatChannel> {
        const chatChannelId = await this.status(liveChannelId)
            .then(status => status?.chatChannelId)
            .catch(() => null);

        const uid = await this.user().then(user => user?.userIdHash);
        const token = await this.accessToken(chatChannelId).then(token => token.accessToken);

        const processId = getServiceId(chatChannelId) & 0x1f;
        const workerId = getServiceId(chatChannelId) & 0xf;
        const pwId = (workerId * 2 ** 5) | processId;

        return {
            liveChannelId,
            chatChannelId,
            uid,
            pwId,
            token,
            isReConnect: false,
        };
    }
}

export default class ChzzkWebSocket extends EventEmitter {
    private ws?: WebSocket;

    private chatCount: number = 0;

    private userList = new Map<string, any>(); // 유저 리스트

    private uid?: string;
    // private sid?: string;
    // private token?: string;

    // private liveChannelId: string = ''; // 라이브 채널 ID
    // private chatChannelId: string = ''; // 채팅 채널 ID

    private chatChannels = new Map<string, ChatChannel>();
    private chatCids = new Map<string, string>();

    private connected: boolean = false;

    private pingTimeoutId?: NodeJS.Timeout;
    private taskIntervalId?: NodeJS.Timeout;

    private serverId: number = 1;
    private api?: ChzzkAPI;

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

    get host() {
        return `wss://kr-ss${this.serverId}.chat.naver.com/chat`;
    }

    get chatSize() {
        return this.chatCount;
    }

    get users() {
        return this.userList;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * 소캣을 연결합니다.
     */
    async connect() {
        //
        if (this.isConnect) {
            return this;
        }

        this.ws = new WebSocket(this.host);
        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onclose = this.onClose.bind(this);
        this.ws.onmessage = this.handelMessage.bind(this);

        console.log('CONNECT', this.host);

        return this;
    }

    async disconnect() {
        if (!this.isConnect) {
            return;
        }

        this.ws?.close();

        this.ws = undefined;
        this.connected = false;
    }

    async reconnect() {
        // this.reconnected = true;

        await this.disconnect();
        await this.connect();
    }

    private onOpen() {
        this.connected = true;

        this.emit('ready');
        // if (!this.isReConnect) this.startTask();
    }

    private onClose() {
        // if (!this.isReConnect) {
        //     this.emit('disconnect');
        //     this.stopTask();
        // }

        this.stopPingTimer();
        this.ws = undefined;

        if (this.isConnect) this.disconnect();
    }

    //////////////////////////////////////////////////////////////////////////

    private hasConnected() {
        this.hasConnected();
    }

    //////////////////////////////////////////////////////////////////////////

    /**
     * 새로운 채널에 연결합니다.
     * @param channel
     * @returns
     */
    async join(channel: ChatChannel) {
        const { liveChannelId, token, uid, chatChannelId } = channel;
        // N19-VM
        channel.defaultHeader = {
            cid: chatChannelId,
            svcid: 'game',
            ver: '2',
        };

        this.chatChannels.set(channel.liveChannelId, channel);
        this.chatCids.set(channel.chatChannelId, channel.liveChannelId);
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

        if (!this.uid) {
            throw new Error('Not logged in');
        }

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

    private getChatChannel(cid: string) {
        const channelId = this.chatCids.get(cid);
        if (!channelId) {
            throw new Error('Channel not found');
        }
        return this.chatChannels.get(channelId);
    }

    private async handelMessage({ data }: MessageEvent) {
        const { bdy: body, cmd, cid } = JSON.parse(data as string);
        this.emit('raw', { body, cmd });

        switch (cmd) {
            case ChatCmd.CONNECTED: {
                const channel = this.getChatChannel(cid);
                if (channel?.isReConnect) {
                    channel.isReConnect = false;
                    this.emit('reconnect', channel.liveChannelId);
                } else {
                    if (channel) this.emit('connect', channel.liveChannelId);
                }
                break;
            }
            case ChatCmd.PING: {
                this.ws?.send(
                    JSON.stringify({
                        cmd: ChatCmd.PONG,
                        ver: '2',
                    })
                );
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
                    const type = this.getContentAllias(chat, 'msgTypeCode', 'messageTypeCode') || '';
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
                // this.emit('notice', Object.keys(body).length != 0 ? this.parseChat(body) : null);
                break;
            case ChatCmd.BLIND:
                this.emit('blind', body);
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

    private getContentAllias(conent: any, ...alias: string[]) {
        for (const a of alias) {
            if (conent[a]) {
                return conent[a];
            }
        }
        return null;
    }

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
            id: this.getMessageId(time, channel?.pwId || 0), // 메세지 ID 생성 (Snowflake)
            isRecent,
        };

        if (memberCount) {
            parsed.memberCount = memberCount;
        }

        return parsed;
    }

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
        console.log('SEND', requsetData);
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
