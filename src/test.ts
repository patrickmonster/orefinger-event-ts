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

import chzzkChatMessage from 'components/chatbot/chzzk';
import ChatServer from 'utils/chat/server';

import { Content as ChzzkContent } from 'interfaces/API/Chzzk';

import { authTypes } from 'controllers/auth';
import 'utils/procesTuning';

const server = new ChatServer<ChzzkContent>();

server.on('message', chat => {
    const {
        message,
        extras: { streamingChannelId },
    } = chat;

    const client = server.getServer(streamingChannelId);
    if (!client || !message) return;

    try {
        chzzkChatMessage(client, chat);
    } catch (e) {}
});

// server.on('message', ({ message, profile: { nickname }, extras: { streamingChannelId } }) => {
//     console.log(nickname, '::', message);
// });

server.on('join', channelId => {
    console.log('join', channelId);
});
server.on('close', channelId => {
    console.log('close', channelId);
});

///////////////////////////////////////////////////////////////////////////////

server.addServer('e229d18df2edef8c9114ae6e8b20373a');

authTypes(true, 13).then(([type]) => {
    if (!type) return;

    console.log('SET AUTH', type.scope, type.client_sc);

    server.init(type.scope, type.client_sc);
});
