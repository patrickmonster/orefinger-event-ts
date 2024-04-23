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
import Chzzk, { ChatMessage } from 'utils/chat/chzzk';
import { LoopRunQueue } from 'utils/object';

const appendChat = LoopRunQueue<ChatLog>(
    chats => {
        insertChatQueue(chats).catch(console.error);
    },
    1000 * 60,
    500
);

const client = new Chzzk({
    liveChannelId: '458f6ec20b034f49e0fc6d03921646d2',
});

client
    .on('chat', (chat: ChatMessage) => {
        const {
            time,
            id,
            message,
            hidden,
            extras: { osType, streamingChannelId },
            profile: { userIdHash },
        } = chat;

        console.log('MESSAGE ::', time, id, client.chatSize, message);

        appendChat({
            channel_id: streamingChannelId,
            message_id: id,
            message,
            user_id: userIdHash,
            os_type: osType || '-',
            hidden_yn: hidden ? 'Y' : 'N',
        });
    })
    .on('error', console.error)
    .on('close', () => {
        console.log('CLOSE');
    });
client.connect();
