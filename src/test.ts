import { config } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';
import { env } from 'process';
import ChatServer from 'utils/chat/server';

const envDir = join(env.PWD || __dirname, `/.env`);
if (existsSync(envDir)) {
    config({ path: envDir });
} else {
    // 로컬버전 - 운영 환경에서는 빌드시 자동으로 .env 파일을 생성함.
    config({
        path: join(env.PWD || __dirname, `/src/env/.env.${env.NODE_ENV}`),
    });
}

import { selectChatServer } from 'controllers/chat/chzzk';
import { ChatDonation, ChatMessage } from 'interfaces/chzzk/chat';

const server = new ChatServer({
    concurrency: 2,
    onMessage: (chat: ChatMessage) => {
        const {
            message,
            id,
            extras: { streamingChannelId },
            profile: { nickname },
        } = chat;
        console.log('CHAT ::', streamingChannelId, id, nickname, '::', message);
    },
    onDonation: (chat: ChatDonation) => {
        const {
            message,
            id,
            extras: { streamingChannelId, payAmount },
            profile: { nickname },
        } = chat;
        console.log('DONATION ::', streamingChannelId, id, nickname, '::', message);
    },
});

selectChatServer(4).then(servers => {
    server.addServers(...servers.map(server => server.hash_id));
});
