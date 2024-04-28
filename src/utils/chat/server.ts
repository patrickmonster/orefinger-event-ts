import { ChatDonation, ChatMessage, ChatOption } from 'interfaces/chzzk/chat';

import PQueue from 'p-queue';

import ChzzkChat, { ChzzkAPI } from 'utils/chat/chzzk';
import sleep from 'utils/sleep';

/**
 * 채팅 서버 옵션
 * @interface ChatServerOption
 */
interface ChatServerOption extends ChatOption {
    concurrency?: number; // 동시에 생성할 수 있는 서버 수
    onMessage?: (chat: ChatMessage) => void;
    onDonation?: (chat: ChatDonation) => void;
}

/**
 * 채팅 서버 관리자
 */
export default class ChatServer {
    private servers = new Map<string, ChzzkChat>(); // 서버 목록
    private queue: PQueue; // 동시 실행 가능한 서버 수

    private onmessage: (chat: ChatMessage) => void;
    private ondonation: (chat: ChatDonation) => void;

    private api: ChzzkAPI;
    private uid?: string;

    constructor(options?: ChatServerOption) {
        this.api = new ChzzkAPI(options);
        this.queue = new PQueue({ concurrency: options?.concurrency || 1 });

        this.onmessage = options?.onMessage || (() => {});
        this.ondonation = options?.onDonation || (() => {});

        this.api.user().then(user => {
            this.uid = user?.userIdHash;
        });
    }

    public addServer(roomId: string, chatChannelId?: string) {
        if (this.servers.has(roomId)) return 0;
        if (this.servers.size > 60000) return -1; // 서버 수 제한
        this.queue.add(async () => {
            if (!chatChannelId)
                chatChannelId = await this.api
                    .status(roomId)
                    .then(status => status?.chatChannelId)
                    .catch(() => null);
            if (!chatChannelId) {
                console.error('INVALID CHAT CHANNEL ID', roomId);
                return;
            }

            const token = await this.api.accessToken(chatChannelId).then(token => token.accessToken);
            const server = new ChzzkChat({
                //
                chatChannelId,
                liveChannelId: roomId,
                token: token,
                uid: this.uid,
            })
                .on('chat', this.onmessage.bind(this))
                .on('donation', this.ondonation.bind(this))
                .on('ready', () => {
                    console.log('CONNECTED TO CHAT SERVER', roomId, chatChannelId);
                });
            this.servers.set(roomId, server);

            await server.connect();
            await sleep(1000); // 1초 대기
        });

        return this.queue.size;
    }

    public send(roomId: string, message: string) {
        const server = this.servers.get(roomId);
        if (server) {
            server.sendChat(message);
        }
    }

    get serverList() {
        return this.servers.values();
    }

    public addServers(...roomIds: string[]) {
        const out = [];
        for (const roomId of roomIds) {
            out.push(this.addServer(roomId));
        }

        return out;
    }

    public async removeServer(roomId: string) {
        const server = this.servers.get(roomId);
        if (server) {
            server.disconnect();
            this.servers.delete(roomId);
        }
    }

    public getServer(roomId: string) {
        return this.servers.get(roomId);
    }

    public get serverState() {
        let total = 0;
        for (const server of this.servers.values()) {
            total += server.userTotalCount;
        }

        return {
            count: this.servers.size,
            userCount: total,
        };
    }
}
