import { String } from 'aws-sdk/clients/cloudtrail';
import axios from 'axios';
import EventEmitter from 'events';
import PQueue from 'p-queue';

import { selectChatUsers, selectCommand, upsertChatUser, upsertCommand } from 'controllers/chat/chzzk';
import { ChatDonation, ChatMessage, ChatOption } from 'interfaces/chzzk/chat';

import ChzzkChat, { ChatUser, ChzzkAPI, Command } from 'utils/chat/chzzk';
import { getTimeDiff } from 'utils/day';
import { createInterval } from 'utils/inteval';
import { appendUrlHttp } from 'utils/object';
import sleep from 'utils/sleep';

export interface ChatMessageT extends ChatMessage {}
export interface ChatDonationT extends ChatDonation {}

export type BaseChatMessage<C extends any> = (ChatDonation | ChatMessage) & {
    reply: (message: string) => void;
    commands: C[];
};

/**
 * 채팅 서버 옵션
 * @interface ChatServerOption
 */
interface ChatServerOption<T> extends ChatOption {
    concurrency?: number; // 동시에 생성할 수 있는 서버 수
}

/**
 * 채팅 서버 관리자
 *  - 다중 서버에 접속하여 채팅을 관리합니다.
 *
 *
 */
export default class ChatServer<
    T extends {
        liveTitle: string;
        liveCategoryValue: string;
        openDate: string;
        channel: { channelName: string };
    } = any,
    U extends ChatUser & {
        point: number;
    } = any,
    C extends Command & { type: number } = any
> extends EventEmitter {
    private servers = new Map<string, ChzzkChat>(); // 서버 목록
    private state = new Map<string, T>(); // 라이브 상태
    private queue: PQueue; // 동시 실행 가능한 서버 수

    private _api: ChzzkAPI;
    private uid?: string;

    constructor(options?: ChatServerOption<C>) {
        super();
        this._api = new ChzzkAPI(options);
        this.queue = new PQueue({ concurrency: options?.concurrency || 1 });

        this.queue.add(async () => {
            const user = await this._api.user();
            this.uid = user?.userIdHash;
            await sleep(1000); // 1초 대기
        });

        createInterval(1000 * 60 * 30, () => {
            this.servers.forEach(server => {
                if (server.isEdit) {
                    // 명령어 업데이트
                    const commands = this.servers.get(server.roomId)?.commands;
                    if (commands) {
                        upsertCommand(
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
    }

    get api() {
        return this._api;
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
     * 채팅 서버 추가
     * @param roomId
     * @param chatChannelId
     * @returns
     */
    addServer(roomId: string, chatChannelId?: string, callback?: Function) {
        if (this.servers.has(roomId)) return 0;
        if (this.servers.size > 60000) return -1; // 서버 수 제한
        this.queue.add(async () => {
            if (!chatChannelId)
                chatChannelId = await this._api
                    .status(roomId)
                    .then(status => status?.chatChannelId)
                    .catch(e => {
                        console.error('ERROR', e);
                        return '';
                    });
            if (!chatChannelId) {
                console.error('INVALID CHAT CHANNEL ID', roomId);
                return;
            }

            const token = await this.getToken(chatChannelId);
            const server = new ChzzkChat<U, C>({
                //
                chatChannelId,
                liveChannelId: roomId,
                token: token,
                uid: this.uid,
            })
                .on('chat', chat => this.onChat(roomId, chat))
                .on('donation', chat => this.onChat(roomId, chat))
                .on('recnnect', () => this.emit('reconnect', roomId, chatChannelId))
                .on('close', () => {
                    console.log('DISCONNECTED FROM CHAT SERVER', roomId, chatChannelId);

                    this.saveUser(roomId).catch(console.error);
                    this.saveCommand(roomId).catch(console.error);

                    this.emit('close', roomId, chatChannelId);
                    this.servers.delete(roomId);
                })
                .on('ready', () => {
                    console.log('CONNECTED TO CHAT SERVER', roomId, chatChannelId);
                    this.emit('ready', roomId, chatChannelId);
                });
            this.servers.set(roomId, server);

            this.loadUser(roomId).catch(console.error);
            this.loadCommand(roomId).catch(console.error);

            this.emit('join', roomId, chatChannelId);

            await server.connect();
            await sleep(100); // 1초 대기
        });

        return this.queue.size;
    }

    async saveUser(roomId: String) {
        const users = this.servers.get(roomId)?.users;
        if (users) {
            upsertChatUser(...users).catch(console.error);
        }
    }

    async loadUser(roomId: string) {
        const server = this.servers.get(roomId);
        if (server) {
            server.users = (await selectChatUsers(roomId)) as U[];
        }
    }

    async saveCommand(roomId: String) {
        const commands = this.servers.get(roomId)?.commands;
        if (commands) {
            await upsertCommand(
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

    async loadCommand(roomId: string) {
        const server = this.servers.get(roomId);
        if (server) {
            server.commands = await selectCommand(roomId);
        }
    }

    async getChannelState(roomId: string): Promise<T> {
        return await this.api.status(roomId);
    }

    async updateChannel(roomId: string, chatChannelId: string) {
        const server = this.servers.get(roomId);
        const token = await this.getToken(chatChannelId);
        if (!server || !token) return;

        server.updateChannel(chatChannelId, token);
    }

    async getToken(chatChannelId: string): Promise<string> {
        return await this.api.accessToken(chatChannelId).then(token => token.accessToken);
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
            userId: userIdHash,
            streamer: liveStatus?.channel?.channelName,
            streamerId: streamingChannelId,
            member: memberCount,
            id,
            channel: cid,
            title: liveStatus?.liveTitle,
            game: liveStatus?.liveCategoryValue,
            gameValue: liveStatus?.liveCategoryValue,

            // TODO: Add more aliases
            pid: process.env.ECS_ID,
            count: (this.getServer(streamingChannelId)?.chatSize || 1).toLocaleString(),
        };

        return message.replace(/\{([^\}])\}/gi, (match, name) => alias[name] || match);
    }

    static CommandBlock = /\$\{([^\}^ ]+) ?([^\}^ ]+)?\}/gi;

    /**
     * 명령어 블럭 처리
     * @param chat
     */
    private async convertCommandBlock(chat: ChatMessage | ChatDonation, message: string) {
        const tmp = `${message}`;
        let match;
        // ChatServer.CommandBlock.test(tmp)
        while ((match = ChatServer.CommandBlock.exec(message))) {
            const [, command, target] = match;
            switch (command) {
                case 'uptime':
                    return getTimeDiff(target);
                case 'feat':
                    if (target) axios.post(appendUrlHttp(target), { feat: target });
                    else return `ERROR] Notfound feat command 'target' - \${feat url}`;
                    break;
                case 'post':
                    // r.orefinger.click
                    // https://r.orefinger.click/l/chzzk/9351394
                    break;
                default:
                //
            }
        }
        return tmp;
    }
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
            commands: server.commands as C[],
            reply: (message: string) => {
                try {
                    server.sendChat(this.convertSendCommand(chat, message));
                } catch (e) {
                    console.error('Chat ERROR', e);
                    return message;
                }
            },
        });
    }

    //////////////////////////////////////////////////////////////////////

    /**
     * 라이브 상태 업데이트
     * @param roomId
     * @param liveStatus
     */
    updateLiveState(roomId: string, liveStatus: any) {
        if (this.servers.has(roomId)) this.state.set(roomId, liveStatus);
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

    setServerState(roomId: string, state: T) {
        this.state.set(roomId, state);
    }

    removeServer(roomId: string) {
        const server = this.servers.get(roomId);
        if (server) {
            server.disconnect();
            this.servers.delete(roomId);
        }
    }

    moveServer(roomId: string) {
        const state = this.state.get(roomId);
        if (state) this.removeServer(roomId);
        return state;
    }

    getServer(roomId: string) {
        return this.servers.get(roomId);
    }
}
