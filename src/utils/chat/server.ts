import { selectChatUsers, selectCommand, upsertChatUser, upsertCommand } from 'controllers/chat/chzzk';
import { ChatDonation, ChatMessage, ChatOption } from 'interfaces/chzzk/chat';

import PQueue from 'p-queue';

import ChzzkChat, { ChatUser, ChzzkAPI, Command } from 'utils/chat/chzzk';
import sleep from 'utils/sleep';

export interface ChatMessageT extends ChatMessage {
    reply: (message: string) => void;
}

export interface ChatDonationT extends ChatDonation {
    reply: (message: string) => void;
}

/**
 * 채팅 서버 옵션
 * @interface ChatServerOption
 */
interface ChatServerOption extends ChatOption {
    concurrency?: number; // 동시에 생성할 수 있는 서버 수
    onMessage?: (chat: ChatMessageT | ChatDonationT) => void;
    onReady?: (roomId: string, chatChannelId: string) => void;
    onClose?: (roomId: string, chatChannelId: string) => void;
}

interface BaseChatCommand {
    name: string;
    description: string;
    type: number;
}

/**
 * 채팅 명령어
 */
interface ChatMessageCommand extends BaseChatCommand {
    type: 1;
}

/**
 * 채팅 반복 명령어
 */
interface IntervalChatCommand extends BaseChatCommand {
    type: 2;
    loopTime: number; // seconds
}

/**
 * 채팅 기부 명령어
 */
interface ChatDonationCommand extends BaseChatCommand {
    type: 3;
    amount: number;
}

/**
 * 채팅 포인트 명령어
 */
interface ChatPointCommand extends BaseChatCommand {
    type: 4;
    amount: number;
}

type ChatCommand = ChatMessageCommand | ChatPointCommand | ChatDonationCommand | IntervalChatCommand;

/**
 * 채팅 서버 관리자
 *  - 다중 서버에 접속하여 채팅을 관리합니다.
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
    } = any
> {
    private servers = new Map<string, ChzzkChat>(); // 서버 목록
    private state = new Map<string, T>(); // 라이브 상태
    private queue: PQueue; // 동시 실행 가능한 서버 수

    private onmessage: (chat: ChatMessageT | ChatDonationT) => void;
    private onready: (roomId: string, chatChannelId: string) => void;
    private onclose: (roomId: string, chatChannelId: string) => void;

    private api: ChzzkAPI;
    private uid?: string;

    constructor(options?: ChatServerOption) {
        this.api = new ChzzkAPI(options);
        this.queue = new PQueue({ concurrency: options?.concurrency || 1 });

        this.onmessage = options?.onMessage || (() => {});
        this.onready = options?.onReady || (() => {});
        this.onclose = options?.onClose || (() => {});

        this.queue.add(async () => {
            const user = await this.api.user();
            this.uid = user?.userIdHash;
            await sleep(1000); // 1초 대기
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

            const token = await this.getToken(chatChannelId);
            const server = new ChzzkChat<U, Command & { type: number }>({
                //
                chatChannelId,
                liveChannelId: roomId,
                token: token,
                uid: this.uid,
            })
                .on('chat', chat => this.onChat(roomId, chat))
                .on('donation', chat => this.onChat(roomId, chat))
                .on('close', () => {
                    console.log('DISCONNECTED FROM CHAT SERVER', roomId, chatChannelId);
                    const users = this.servers.get(roomId)?.users;
                    if (users) {
                        upsertChatUser(...users).catch(console.error);
                    }

                    const commands = this.servers.get(roomId)?.commands;
                    if (commands) {
                        upsertCommand(
                            roomId,
                            ...commands.map(({ answer, command }) => {
                                return {
                                    command,
                                    message: answer,
                                    type: 1,
                                };
                            })
                        ).catch(console.error);
                    }
                    this.onclose(roomId, `${chatChannelId}`);
                    this.servers.delete(roomId);
                })
                .on('ready', () => {
                    console.log('CONNECTED TO CHAT SERVER', roomId, chatChannelId);
                    this.onready(roomId, `${chatChannelId}`);
                });
            this.servers.set(roomId, server);
            server.users = (await selectChatUsers(roomId)) as U[];
            server.commands = await selectCommand(roomId);

            await server.connect();
            await sleep(100); // 1초 대기
        });

        return this.queue.size;
    }

    reloadCommand = async (roomId: string) => {
        const server = this.servers.get(roomId);
        if (server) {
            server.commands = await selectCommand(roomId);
        }
    };

    reloadCommands = async () => {
        for (const roomId of this.servers.keys()) {
            await this.reloadCommand(roomId);
        }
    };

    /**
     * 전송 메세지를 명령어로 변환합니다.
     * @param origin
     * @returns {string}
     */
    private convertSendCommand(chat: ChatMessage | ChatDonation, message: string) {
        const { profile, extras, cid, memberCount, id } = chat;
        const { userIdHash, nickname } = profile;
        const { streamingChannelId } = extras;

        const client = this.getServer(streamingChannelId);
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
            uptime: liveStatus?.openDate,
            list:
                client?.commands
                    .map(({ command }) => command)
                    .join(', ')
                    .slice(0, 2000) || '{오류가 발생했습니다}',

            // TODO: Add more aliases
            pid: process.env.ECS_ID,
            count: (this.getServer(streamingChannelId)?.chatSize || 1).toLocaleString(),
        };

        const keys = Object.keys(alias);
        for (const key of keys) {
            message = message.replace(`{${key}}`, alias[key]);
        }

        return message;
    }

    convertCommand(command: ChatCommand) {
        // TODO: Add command
        const { type } = command;

        switch (type) {
            case 1: // 채팅 명령어
            case 2: // 채팅 반복 명령어
            case 3: // 채팅 기부 명령어
            case 4: // 채팅 포인트(사용) 명령어
        }
    }

    /**
     * 라이브 상태 업데이트
     * @param roomId
     * @param liveStatus
     */
    updateLiveState(roomId: string, liveStatus: any) {
        if (this.servers.has(roomId)) this.state.set(roomId, liveStatus);
    }

    public addServers(...roomIds: string[]) {
        for (const roomId of roomIds) {
            this.addServer(roomId);
        }
        return this.queue.size;
    }

    /**
     * 채팅 메세지 이벤트
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
        this.onmessage({
            ...chat,
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

    get serverSzie() {
        return this.servers.size;
    }

    public async getToken(chatChannelId: string) {
        return await this.api.accessToken(chatChannelId).then(token => token.accessToken);
    }

    public async updateChannel(roomId: string, chatChannelId: string) {
        const server = this.servers.get(roomId);
        const token = await this.getToken(chatChannelId);
        if (!server || !token) return;

        server.updateChannel(chatChannelId, token);
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

    setServerState(roomId: string, state: T) {
        this.state.set(roomId, state);
    }

    public async removeServer(roomId: string) {
        const server = this.servers.get(roomId);
        if (server) {
            server.disconnect();
            this.servers.delete(roomId);
        }
    }

    public moveServer(roomId: string) {
        const state = this.state.get(roomId);
        const server = this.servers.get(roomId);
        if (state && server) {
            server.disconnect();
            return state as T;
        }
        return null;
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
