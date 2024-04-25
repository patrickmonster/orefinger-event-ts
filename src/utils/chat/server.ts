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

export default class ChatServer {
    private servers = new Map<string, ChzzkChat>(); // 서버 목록
    private queue: PQueue; // 동시 실행 가능한 서버 수

    private onmessage: (chat: ChatMessage) => void;
    private ondonation: (chat: ChatDonation) => void;

    private api: ChzzkAPI;

    constructor(options?: ChatServerOption) {
        this.api = new ChzzkAPI(options);
        this.queue = new PQueue({ concurrency: options?.concurrency || 1 });

        this.onmessage = options?.onMessage || (() => {});
        this.ondonation = options?.onDonation || (() => {});
    }

    public addServer(roomId: string) {
        if (this.servers.has(roomId)) return 0;
        if (this.servers.size > 60000) return -1; // 서버 수 제한
        this.queue.add(async () => {
            const channel = await this.api.createChannel(roomId);

            const server = new ChzzkChat(ChzzkAPI.serverId(channel.chatChannelId), this.api)
                .on('chat', this.onmessage.bind(this))
                .on('donation', this.ondonation.bind(this))
                .on('ready', () => {
                    server.join(channel);
                });
            this.servers.set(roomId, server);

            await server.connect();
            await sleep(1000); // 1초 대기
        });

        return this.queue.size;
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
