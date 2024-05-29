import { String } from 'aws-sdk/clients/cloudtrail';
import EventEmitter from 'events';
import PQueue from 'p-queue';

import { selectChatUsers, selectCommand, upsertChatUser, upsertCommands } from 'controllers/chat/chzzk';
import { ChatDonation, ChatMessage } from 'interfaces/chzzk/chat';

import { Content as ChzzkContent } from 'interfaces/API/Chzzk';

import ChzzkChat, { ChatUser, ChzzkAPI, Command } from 'utils/chat/chzzk';
import { createInterval } from 'utils/inteval';
import { REDIS_KEY, loadRedis } from 'utils/redis';
import sleep from 'utils/sleep';

export interface ChatMessageT extends ChatMessage {}
export interface ChatDonationT extends ChatDonation {}

export type BaseChatMessage<C extends any> = (ChatDonation | ChatMessage) & {
    reply: (message: string) => void;
    commands: C[];
};

/**
 * 채팅 서버 관리자
 *  - 다중 서버에 접속하여 채팅을 관리합니다.
 *
 *
 */
export default class ChatServer<
    U extends ChatUser & {
        point: number;
    } = any,
    C extends Command & { type: number } = any
> extends EventEmitter {
    private hashId = new Map<string, string>(); // 알림 ID -> 채널 ID
    private liveId = new Map<string, string>(); // 알림 ID -> 채널 ID
    private state = new Map<string, ChzzkContent>(); // 라이브 상태
    private servers = new Map<string, ChzzkChat>(); // 서버 목록

    private queue: PQueue; // 동기화 큐

    private _api: ChzzkAPI;
    private uid?: string;

    constructor() {
        super();
        this._api = new ChzzkAPI();
        this.queue = new PQueue({ concurrency: 1, autoStart: false });

        createInterval(1000 * 60 * 30, () => {
            this.servers.forEach(server => {
                if (server.isEdit) {
                    // 명령어 업데이트
                    const commands = this.servers.get(server.roomId)?.commands;
                    if (commands) {
                        upsertCommands(
                            server.roomId,
                            ...commands.map(({ answer, command }) => {
                                return {
                                    command,
                                    message: answer,
                                    type: 1,
                                };
                            })
                        ).catch(console.error);
                    }
                    server.isEdit = false;
                }
            });
        });

        this.queue.add(async () => {
            const user = await this._api.user();
            this.uid = user?.userIdHash;
            await sleep(1000); // 1초 대기
        });
    }

    init(auth: string, session: string) {
        if (this._api.isMatched(auth, session)) return;

        this._api.setAuth(auth, session);
        if (this.queue.isPaused) {
            this.queue.start();
            this.emit('ready');
        } else {
            for (const server of this.servers.values()) {
                server.reconnect();
            }
        }
    }

    get api() {
        return this._api;
    }

    get noticeIds() {
        return this.hashId.keys();
    }

    get serverState() {
        let total = 0;
        for (const server of this.servers.values()) {
            total += server.userTotalCount;
        }

        return {
            count: this.servers.size,
            userCount: total,
        };
    }

    get serverSzie() {
        return this.servers.size;
    }

    get serverList() {
        return this.servers.values();
    }
    //////////////////////////////////////////////////////////////////////

    /**
     * 채널 정보 불러오기
     * @param noticeId
     * @returns
     */
    private async getChannelData(noticeId: string): Promise<ChzzkContent | null> {
        const data = await loadRedis<ChzzkContent>(REDIS_KEY.API.CHZZK_LIVE_STATE(noticeId));
        if (data) {
            this.state.set(noticeId, data);
        }
        return data;
    }

    /**
     * 채팅 서버 추가
     * @param noticeId
     * @returns
     */
    async join(noticeId: string) {
        // redis 에서 채널 정보를 불러옵니다.
        const data = await this.getChannelData(noticeId);
        if (data) {
            const { channelId, chatChannelId } = data as ChzzkContent;
            if (!this.hashId.has(noticeId)) {
                this.hashId.set(noticeId, channelId);
                this.liveId.set(channelId, noticeId);
                return this.addServer(channelId, chatChannelId);
            } else {
                this.updateServer(channelId, chatChannelId);
            }
        }
        return -1;
    }

    async change(noticeId: string) {
        const data = await this.getChannelData(noticeId);
        if (data) {
            const { channelId, chatChannelId } = data as ChzzkContent;
            this.updateServer(channelId, chatChannelId);
        }
    }

    async reload(noticeId: string) {
        const channelId = this.hashId.get(noticeId);
        if (channelId) {
            this.loadUser(channelId).catch(console.error);
            this.loadCommand(channelId).catch(console.error);
        }
    }

    async updates() {
        for (const noticeId of this.hashId.keys()) {
            await this.change(noticeId);
        }
    }

    leave(noticeId: string) {
        const channelId = this.hashId.get(noticeId);
        if (channelId) {
            this.removeServer(channelId);
            this.hashId.delete(noticeId);
        }
    }

    private updateServer(roomId: string, chatChannelId: string) {
        if (!this.servers.has(roomId)) return -1;
        this.queue.add(async () => {
            const token = await this.getToken(chatChannelId);
            const server = this.servers.get(roomId);
            if (server && token) server.updateChannel(chatChannelId, `${token.token}`, `${token.extraToken}`);
        });
    }

    /**
     * 채팅 서버 추가
     * @param roomId
     * @param chatChannelId
     * @returns
     */
    private addServer(roomId: string, chatChannelId: string) {
        if (this.servers.has(roomId)) return 0;
        if (this.servers.size > 60000) return -1; // 서버 수 제한
        console.log('CHAT SERVER ADD ::', roomId);

        this.queue.add(async () => {
            if (!chatChannelId) {
                console.error('INVALID CHAT CHANNEL ID', roomId);
                return;
            }
            const noticeId = this.liveId.get(roomId);

            const token = await this.getToken(chatChannelId);
            const server = new ChzzkChat<U, C>({
                chatChannelId,
                liveChannelId: roomId,
                token: token.token,
                extraToken: token.extraToken,
                uid: this.uid,
            })
                .on('chat', chat => this.onChat(roomId, chat))
                .on('donation', chat => this.onChat(roomId, chat))
                .on('recnnect', () => this.emit('reconnect', noticeId, roomId, chatChannelId))
                .on('close', () => {
                    console.log('DISCONNECTED FROM CHAT SERVER', noticeId, roomId, chatChannelId);

                    this.saveUser(roomId).catch(console.error);
                    this.saveCommand(roomId).catch(console.error);

                    this.emit('close', noticeId, roomId, chatChannelId);
                    this.servers.delete(roomId);
                })
                .on('ready', () => {
                    console.log('CONNECTED TO CHAT SERVER', roomId, chatChannelId);
                    this.emit('ready', roomId, chatChannelId);
                });
            this.servers.set(roomId, server);

            this.loadUser(roomId).catch(console.error);
            this.loadCommand(roomId).catch(console.error);

            this.emit('join', noticeId, roomId, chatChannelId);
            console.log('CHAT SERVER JOIN ::', roomId, chatChannelId);
            await server.connect();
            await sleep(1000); // 1초 대기
        });
        return this.queue.size;
    }

    private async saveUser(roomId: String) {
        const users = this.servers.get(roomId)?.users;
        if (users) {
            upsertChatUser(...users).catch(console.error);
        }
    }

    private async loadUser(roomId: string) {
        const server = this.servers.get(roomId);
        if (server) {
            server.users = (await selectChatUsers(roomId)) as U[];
        }
    }

    private async saveCommand(roomId: String) {
        const commands = this.servers.get(roomId)?.commands;
        if (commands) {
            await upsertCommands(
                roomId,
                ...commands.map(({ answer, command }) => {
                    return {
                        command,
                        message: answer,
                        type: 1,
                    };
                })
            );
        }
    }

    private async loadCommand(roomId: string) {
        const server = this.servers.get(roomId);
        if (server) {
            server.commands = await selectCommand(roomId);
        }
    }

    async reconnect(noticeId: string) {
        const server = this.servers.get(noticeId);
        if (server) {
            server.reconnect();
        }
    }

    async getToken(chatChannelId: string): Promise<{
        token: string;
        extraToken: string;
    }> {
        return await this.api.accessToken(chatChannelId).then(token => {
            return {
                token: `${token?.accessToken}`,
                extraToken: `${token?.extraToken}`,
            };
        });
    }

    //////////////////////////////////////////////////////////////////////

    /**
     * 별칭을 명령어로 변환
     * @param origin
     * @returns {string}
     */
    private convertSendCommand(chat: ChatMessage | ChatDonation, message: string) {
        const { profile, extras, cid, memberCount, id } = chat;
        const { userIdHash, nickname } = profile;
        const { streamingChannelId } = extras;
        const liveStatus = this.state.get(streamingChannelId);

        const alias: {
            [key: string]: any;
        } = {
            user: nickname,
            member: memberCount,

            // TODO: Add more aliases
            pid: process.env.ECS_ID || 'LOCAL',
            count: (this.getServer(streamingChannelId)?.chatSize || 1).toLocaleString(),
        };

        return message.replace(/\{([^\}]+)\}/gi, (match, name) => {
            console.log('match', match, name);
            return alias[name] || match;
        });
    }

    static CommandBlock = /\$\{([^\}^ ]+) ?([^\}^ ]+)?\}/gi;

    /**
     * 채팅 메세지 튜닝
     * @param roomId
     * @param chat
     * @returns
     */
    private onChat(roomId: string, chat: ChatMessage | ChatDonation) {
        const server = this.servers.get(roomId);

        if (!server) {
            console.log('INVALID SERVER', roomId);
            return;
        }

        this.emit('message', {
            ...chat,
            server,
            commands: server.commands as C[],
            reply: (message: string) => {
                try {
                    server.sendChat(this.convertSendCommand(chat, message));
                } catch (e) {
                    console.error('Chat ERROR', e);
                }
            },
        });
    }

    //////////////////////////////////////////////////////////////////////

    getState(roomId: string) {
        return this.state.get(roomId);
    }

    send(roomId: string, message: string) {
        const server = this.servers.get(roomId);
        if (server) {
            server.sendChat(message);
        }
    }

    sendAll(message: string) {
        for (const server of this.servers.values()) {
            server.sendChat(message);
        }
    }

    hasServer(roomId: string) {
        return this.servers.has(roomId);
    }

    removeServer(roomId: string) {
        const server = this.servers.get(roomId);
        if (server) {
            server.disconnect();
            this.servers.delete(roomId);
        }
    }

    getServer(roomId: string) {
        return this.servers.get(roomId);
    }
}
