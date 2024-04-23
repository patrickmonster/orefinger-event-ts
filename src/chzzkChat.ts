import { ChatLog, insertChatQueue } from 'controllers/chat/chzzk';
import ChzzkWebSocket, { ChatMessage } from 'utils/chat/chzzk';
import { LoopRunQueue } from 'utils/object';
import { error as errorLog } from './utils/logger';

/**
 *
 * @description 알림 작업을 수행하는 스레드로써, 각 알림 스캔 작업을 수행합니다.
 */

const tasks = new Map<string, ChzzkWebSocket>();

const log = (...message: any[]) => console.log(`CHAT ::`, ...message);

const userState = new Map<string, number>(); // 유저 포인트

// 메세지 로깅용 큐
const appendChat = LoopRunQueue<ChatLog>(
    chats => {
        insertChatQueue(chats).catch(console.error);
    },
    1000 * 60,
    500
);

process.on('message', async (message: { type: string; data: any }) => {
    const { type } = message;
    switch (type) {
        case 'add': {
            const { channelId } = message.data;
            createTask(channelId);
            break;
        }
        case 'list': {
            process.send?.({
                type: 'list',
                data: Array.from(tasks.keys()),
            });
            break;
        }
    }
});

const createTask = async (channelId: string) => {
    const task = new ChzzkWebSocket({
        liveChannelId: channelId,
        nidAuth: process.env.NID_AUTH,
        nidSession: process.env.NID_SECRET,
    });

    tasks.set(
        channelId,
        await task
            .on('chat', (chat: ChatMessage) => {
                const {
                    id,
                    message,
                    hidden,
                    extras: { osType },
                    profile: { userIdHash },
                } = chat;

                appendChat({
                    channel_id: task.channelId,
                    message_id: id,
                    message,
                    user_id: userIdHash,
                    os_type: osType || '-',
                    hidden_yn: hidden ? 'Y' : 'N',
                });
            })
            .on('close', () => {
                tasks.delete(channelId);
            })
            .connect()
    );
};

const interval = setInterval(() => {
    tasks.forEach((task, channelId) => {
        if (!task.isConnect) {
            tasks.delete(channelId);
            log('delete', channelId);
        }
    });
    log('tasks', tasks.size);
}, 10000);

process.on('unhandledRejection', (err, promise) => {
    errorLog('unhandledRejection', JSON.stringify(err, Object.getOwnPropertyNames(err)));
    console.error('unhandledRejection', err);
});
process.on('uncaughtException', (err, promise) => {
    errorLog('uncaughtException', JSON.stringify(err, Object.getOwnPropertyNames(err)));
    console.error('uncaughtException', err);
});

process.on('SIGINT', function () {
    clearInterval(interval);
    console.error(`=============================${process.pid}번 프로세서가 종료됨=============================`);
    process.exit();
});
