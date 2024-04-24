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

const api = new ChzzkAPI({
    nidAuth: process.env.NID_AUTH,
    nidSession: process.env.NID_SECRET,
});

const server = new Chzzk(1, api)
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
        await server.join('e229d18df2edef8c9114ae6e8b20373a');
    });
const server2 = new Chzzk(1, api)
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
        await server.join('0fe5c17cea248431e3747d95b7f038eb');
    });
