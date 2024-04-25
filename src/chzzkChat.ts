import { ChatLog, insertChatQueue } from 'controllers/chat/chzzk';
import { ChatDonation, ChatMessage } from 'interfaces/chzzk/chat';
import { LoopRunQueue } from 'utils/object';
import { error as errorLog } from './utils/logger';

import ChatServer from './utils/chat/server';

/**
 *
 * @description 알림 작업을 수행하는 스레드로써, 각 알림 스캔 작업을 수행합니다.
 */

// 메세지 로깅용 큐
const addQueue = LoopRunQueue<ChatLog>(
    async chats => await insertChatQueue(chats).catch(console.error),
    1000 * 60,
    500
);

const appendChat = (chat: ChatMessage | ChatDonation) => {
    const {
        id,
        message,
        hidden,
        extras: { osType },
        profile: { userIdHash },
        cid,
    } = chat;

    addQueue({
        channel_id: cid,
        message_id: id,
        message,
        user_id: userIdHash,
        os_type: osType || '-',
        hidden_yn: hidden ? 'Y' : 'N',
    });
};

if (process.env.ECS_PK && process.env.ECS_REVISION) {
    const { ECS_PK, ECS_REVISION } = process.env;
    const server = new ChatServer({
        concurrency: 1,
        onMessage: chat => {
            appendChat(chat);
        },
        onDonation: (chat: ChatDonation) => {
            appendChat(chat);
        },
    });
} else {
    console.log('ECS_CONTAINER_METADATA_URI is not defined');
}
process.on('unhandledRejection', (err, promise) => {
    errorLog('unhandledRejection', JSON.stringify(err, Object.getOwnPropertyNames(err)));
    console.error('unhandledRejection', err);
});
process.on('uncaughtException', (err, promise) => {
    errorLog('uncaughtException', JSON.stringify(err, Object.getOwnPropertyNames(err)));
    console.error('uncaughtException', err);
});

process.on('SIGINT', function () {
    console.error(`=============================${process.pid}번 프로세서가 종료됨=============================`);
    process.exit();
});
