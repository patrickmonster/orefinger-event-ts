import ChzzkWebSocket, { ChatMessage } from 'utils/chat/chzzk';
import { error as errorLog } from './utils/logger';

/**
 *
 * @description 알림 작업을 수행하는 스레드로써, 각 알림 스캔 작업을 수행합니다.
 */

const tasks = new Map<string, ChzzkWebSocket>();

process.on('message', (message: { type: string; data: any }) => {
    const { type } = message;
    //
    switch (type) {
        case 'chzzk': {
            const { channelId } = message.data;
            const task = new ChzzkWebSocket({
                liveChannelId: channelId,
                nidAuth: process.env.NID_AUTH,
                nidSession: process.env.NID_SECRET,
            });

            tasks.set(channelId, task);

            task.on('chat', (message: ChatMessage) => {
                //
            })
                .on('error', err => {
                    errorLog('chzzk', err);
                })
                .on('close', () => {
                    tasks.delete(channelId);
                })
                .connect();

            break;
        }
    }
});

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
