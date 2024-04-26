import { ChatLog, insertChatQueue } from 'controllers/chat/chzzk';
import { ChatDonation, ChatMessage } from 'interfaces/chzzk/chat';
import { LoopRunQueue } from 'utils/object';

import redis, { REDIS_KEY } from 'utils/redis';
import redisBroadcast from 'utils/redisBroadcast';
import ChatServer from './utils/chat/server';

import { ecsSelect } from 'controllers/log';
import { Content as ChzzkContent } from 'interfaces/API/Chzzk';

import 'utils/procesTuning';

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

const [, file, ECS_ID, ...argv] = process.argv;
if (ECS_ID) {
    const server = new ChatServer({
        nidAuth: process.env.NID_AUTH,
        nidSession: process.env.NID_SECRET,
        concurrency: 2,
        onMessage: chat => {
            appendChat(chat);
        },
        onDonation: (chat: ChatDonation) => {
            appendChat(chat);
        },
    });

    ecsSelect(undefined, ECS_ID).then(([{ idx, revision, family, rownum }]) => {
        process.env.ECS_ID = ECS_ID;
        process.env.ECS_REVISION = revision;
        process.env.ECS_FAMILY = family;
        process.env.ECS_PK = `${idx}`;

        redisBroadcast
            .subscribe(REDIS_KEY.SUBSCRIBE.LIVE_STATE('change'), (message: string) => {
                const { hashId, liveStatus } = JSON.parse(message);
                const { chatChannelId } = liveStatus as ChzzkContent;

                server.getServer(hashId)?.updateChannel(chatChannelId, hashId);
            })
            .catch(console.error);

        // -- 온라인
        redisBroadcast
            .subscribe(REDIS_KEY.SUBSCRIBE.LIVE_STATE('online'), async (message: string) => {
                const { targetId, hashId, liveStatus } = JSON.parse(message);
                const { chatChannelId } = liveStatus as ChzzkContent;
                if (targetId !== idx) return; // 자신의 서버가 아닌 경우

                await server.addServer(hashId, chatChannelId);
            })
            .catch(console.error);

        // -- 오프라인
        redisBroadcast
            .subscribe(REDIS_KEY.SUBSCRIBE.LIVE_STATE('offline'), (message: string) => {
                const { hashId } = JSON.parse(message);

                server.getServer(hashId)?.disconnect();
            })
            .catch(console.error);
    });

    const loop = setInterval(() => {
        // ECS 상태를 전송합니다.
        redis.publish(
            REDIS_KEY.SUBSCRIBE.ECS_CHAT_STATE('channels'),
            JSON.stringify({
                id: process.env.ECS_PK,
                revision: process.env.ECS_REVISION,
                ...server.serverState,
            })
        );
    }, 1000 * 60 * 5);

    process.on('SIGINT', function () {
        for (const s of server.serverList) s.disconnect();
        clearInterval(loop);
    });
} else {
    console.log('ECS_ID is not defined');
}
