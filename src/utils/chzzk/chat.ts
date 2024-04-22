/**
 * 채팅을 위한 소캣 입니다.
 */

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

export default class ChzzkWebSocket {
    private ws?: WebSocket;
    private options: any;

    private uid?: string;

    private defaults = {};

    private sid?: string;
    private handlers: [string, (data: any) => void][] = [];
    private chatChannelId: string = '';

    private connected: boolean = false;
    private reconnected: boolean = false;

    private taskIntervalId?: NodeJS.Timeout;

    constructor(options: {}) {
        this.options = options;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////
    get serverId() {
        return (
            (Math.abs(
                this.chatChannelId
                    .split('')
                    .map(c => c.charCodeAt(0))
                    .reduce((a, b) => a + b)
            ) %
                9) +
            1
        );
    }

    get clientId() {
        return this.chatChannelId;
    }

    get isConnect() {
        return this.connected;
    }
    get isReConnect() {
        return this.reconnected;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * 소캣을 연결합니다.
     */

    connect() {
        //
        if (this.isConnect) {
            throw new Error('이미 연결된 상태');
        }

        this.defaults = {
            cid: this.clientId,
            svcid: 'game',
            ver: '2',
        };

        this.ws = new WebSocket(`wss://kr-ss${this.serverId}.chat.naver.com/chat`);
        this.ws.onopen = this.onOpen.bind(this);
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
                chatChannelId: this.chatChannelId,
                uid: this.uid,
            },
            cmd: ChatCmd.CONNECT,
            tid: 1,
        });

        if (!this.isReConnect) {
            this.startTask();
        }
    }

    private sendRow<T extends Object>(data: { bdy: T; cmd: ChatCmd; tid: number }) {
        if (this.ws) {
            this.ws.send(JSON.stringify({ ...data, ...this.defaults }));
        } else {
            throw new Error('소캣이 연결되지 않았습니다.');
        }
    }

    private startTask() {
        // if (!this.options.pollInterval || this.pollIntervalId) return;
        this.taskIntervalId = setInterval(async () => {
            const chatChannelId = await this.client.live
                .status(this.options.channelId)
                .then(status => status?.chatChannelId)
                .catch(() => null);

            if (chatChannelId && chatChannelId != this.options.chatChannelId) {
                this.options.chatChannelId = chatChannelId;

                await this.reconnect();
            }
        }, this.options.pollInterval);
    }
}
