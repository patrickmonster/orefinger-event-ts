import { ChatLog, insertChatQueue } from 'controllers/chat/chzzk';
import { ChatDonation, ChatMessage } from 'interfaces/chzzk/chat';
import { LoopRunQueue } from 'utils/object';
import { error as errorLog } from './utils/logger';

import { REDIS_KEY, getInstance } from 'utils/redis';
import ChatServer from './utils/chat/server';

import { Content as ChzzkContent } from 'interfaces/API/Chzzk';

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

const { ECS_PK, ECS_REVISION } = process.env;
if (ECS_PK && ECS_REVISION) {
    const server = new ChatServer({
        concurrency: 2,
        onMessage: chat => {
            appendChat(chat);
        },
        onDonation: (chat: ChatDonation) => {
            appendChat(chat);
        },
    });

    // -- 채널 변경
    getInstance()
        .subscribe(REDIS_KEY.SUBSCRIBE.LIVE_STATE('change'), (message: string) => {
            const { hashId, liveStatus } = JSON.parse(message);
            const { chatChannelId } = liveStatus as ChzzkContent;

            server.getServer(hashId)?.updateChannel(chatChannelId, hashId);
        })
        .catch(console.error);

    // -- 온라인
    getInstance()
        .subscribe(REDIS_KEY.SUBSCRIBE.LIVE_STATE('online'), async (message: string) => {
            const { type, id, targetId, noticeId, hashId, liveStatus } = JSON.parse(message);
            const { chatChannelId } = liveStatus as ChzzkContent;
            if (targetId !== ECS_PK) return; // 자신의 서버가 아닌 경우

            await server.addServer(hashId, chatChannelId);
        })
        .catch(console.error);

    // -- 오프라인
    getInstance()
        .subscribe(REDIS_KEY.SUBSCRIBE.LIVE_STATE('offline'), (message: string) => {
            const { hashId, liveStatus } = JSON.parse(message);
            const { chatChannelId } = liveStatus as ChzzkContent;

            server.getServer(hashId)?.disconnect();
        })
        .catch(console.error);

    process.on('SIGINT', function () {
        for (const s of server.serverList) s.disconnect();
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
