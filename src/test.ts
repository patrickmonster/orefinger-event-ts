import { config } from 'dotenv';
import { existsSync } from 'fs';
import { ChatMessage } from 'interfaces/chzzk/chat';
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
});

selectChatServer(4).then(servers => {
    server.addServers(...servers.map(server => server.hash_id));
});

// -- 채널 변경
// redisBroadcast
//     .subscribe(REDIS_KEY.SUBSCRIBE.LIVE_STATE('change'), (message: string) => {
//         const { hashId, liveStatus } = JSON.parse(message);
//         const { chatChannelId } = liveStatus as ChzzkContent;

//         server.getServer(hashId)?.updateChannel(chatChannelId, hashId);
//     })
//     .catch(console.error);

// // -- 온라인
// redisBroadcast
//     .subscribe(REDIS_KEY.SUBSCRIBE.LIVE_STATE('online'), async (message: string) => {
//         const { type, id, targetId, noticeId, hashId, liveStatus } = JSON.parse(message);
//         const { chatChannelId } = liveStatus as ChzzkContent;
//         // if (targetId !== ECS_PK) return; // 자신의 서버가 아닌 경우

//         await server.addServer(hashId, chatChannelId);
//     })
//     .catch(console.error);

// // -- 오프라인
// redisBroadcast
//     .subscribe(REDIS_KEY.SUBSCRIBE.LIVE_STATE('offline'), (message: string) => {
//         const { hashId } = JSON.parse(message);
//         server.getServer(hashId)?.disconnect();
//     })
// .catch(console.error);

process.on('SIGINT', function () {
    for (const s of server.serverList) s.disconnect();
});
