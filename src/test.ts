import { config } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';
import { env } from 'process';

const envDir = join(env.PWD || __dirname, `/.env`);
if (existsSync(envDir)) {
    config({ path: envDir });
} else {
    // 로컬버전 - 운영 환경에서는 빌드시 자동으로 .env 파일을 생성함.
    config({
        path: join(env.PWD || __dirname, `/src/env/.env.${env.NODE_ENV}`),
    });
}

import { ChatLog, insertChatQueue } from 'controllers/chat/chzzk';
import { ChatBase, ChatMessage } from 'interfaces/chzzk/chat';
import Chzzk, { ChzzkAPI } from 'utils/chat/chzzk';
import { LoopRunQueue } from 'utils/object';

const appendChat = LoopRunQueue<ChatLog>(
    async chats => {
        await insertChatQueue(chats).catch(console.error);
    },
    1000 * 60,
    500
);

const servers = new Map<number, Chzzk>();
const getServerInstance = async (chatChannelId: string) =>
    new Promise<Chzzk>((resolve, reject) => {
        const idx = ChzzkAPI.serverId(chatChannelId);

        let server = servers.get(idx);
        if (!server) {
            server = new Chzzk(idx);
            servers.set(idx, server);

            server
                .on('error', console.error)
                .on('close', () => {
                    console.log('CLOSE');
                })
                .once('ready', () => {
                    if (!server) reject('Server is not created');
                    else resolve(server);
                })
                .connect();
        } else resolve(server);
    });

const api = new ChzzkAPI();

api.createChannel('2086f44c7b09a17cef6786f21389db3b').then(async channel => {
    const server = await getServerInstance(channel.liveChannelId);

    server.join(channel);

    server
        .on('chat', (chat: ChatMessage) => {
            const {
                message,
                id,
                profile: { nickname },
            } = chat;
            console.log('CHAT ::', id, nickname, '::', message);
        })
        .on('subscription', (chat: ChatBase<any, any>) => {
            console.log('subscription ::', chat);
        })
        .on('systemMessage', (chat: ChatBase<any, any>) => {
            console.log('systemMessage ::', chat);
        });
});
