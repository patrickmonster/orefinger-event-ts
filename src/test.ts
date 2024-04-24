import { config } from 'dotenv';
import { existsSync } from 'fs';
import { ChatMessage } from 'interfaces/chzzk/chat';
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

import Chzzk, { ChzzkAPI } from 'utils/chat/chzzk';

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

new Chzzk(1)
    .on('error', console.error)
    .on('close', () => {
        console.log('CLOSE');
    })
    .on('chat', (chat: ChatMessage) => {
        const {
            message,
            id,
            extras: {},
            profile: { nickname },
        } = chat;
        console.log('CHAT ::', id, nickname, '::', message);
    })
    .connect()
    .then(async server => {
        await server.joinAsync('034449b176b163a705b9c0e81f7a51c2', 'dcd75ef0f2c664e3270de18696ad43bf');
    });
