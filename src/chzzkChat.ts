import { ChatLog, insertChatQueue, selectChatServer } from 'controllers/chat/chzzk';
import { ChatDonation, ChatMessage } from 'interfaces/chzzk/chat';
import { LoopRunQueue } from 'utils/object';

import { ECSStatePublish } from 'utils/redis';
import { ECSStateSubscribe, LiveStateSubscribe } from 'utils/redisBroadcast';
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
            const { message } = chat;

            if (!message.startsWith('@')) {
                return;
            }

            const [command, ...args] = message.split(' ');

            switch (command) {
                case '@방송알리미':
                    const [channelId, ...msg] = args;
                    const message = msg.join(' ');

                    if (message) {
                        server.send(channelId, `안녕하세요! 디스코드에서 방송알림을 전송하고 있는 방송 알리미 입니다!`);
                    }
                    break;
                default:
                    break;
            }

            //
        },
        onDonation: (chat: ChatDonation) => {
            appendChat(chat);
        },
    });

    ecsSelect(undefined, ECS_ID).then(([{ idx, revision, family }]) => {
        process.env.ECS_ID = ECS_ID;
        process.env.ECS_REVISION = revision;
        process.env.ECS_FAMILY = family;
        process.env.ECS_PK = `${idx}`;

        LiveStateSubscribe('change', ({ hashId, liveStatus }) => {
            const { chatChannelId } = liveStatus as ChzzkContent;
            server.getServer(hashId)?.updateChannel(chatChannelId);
        });

        LiveStateSubscribe('online', ({ targetId, hashId, liveStatus }) => {
            const { chatChannelId } = liveStatus as ChzzkContent;
            if (targetId !== process.env.ECS_PK) return; // 자신의 서버가 아닌 경우
            server.addServer(hashId, chatChannelId);
        });

        LiveStateSubscribe('offline', ({ hashId }) => {
            server.getServer(hashId)?.disconnect();
        });

        // -- 새로운 채널 입장 알림
        ECSStateSubscribe('JOIN', ({ hash_id }) => {
            if (hash_id) server.removeServer(hash_id).catch(console.error);
        });

        // -- 채널 연결 *(명령)
        ECSStateSubscribe('CONNECT', ({ hash_id, id }) => {
            if (id !== process.env.ECS_PK) return; // 자신의 서버가 아닌 경우
            hash_id && server.addServer(hash_id);
        });

        ecsSelect(revision).then(async rows => {
            if (!rows.length) return;
            const ecs = rows.find(row => row.idx === idx);

            if (ecs && ecs.rownum === 1) {
                selectChatServer(4).then(async chats => {
                    for (const { hash_id: hashId } of chats) {
                        server.addServer(hashId);
                        ECSStatePublish('JOIN', {
                            ...server.serverState,
                            hash_id: hashId,
                        });
                    }
                });
            }
        });
    });

    const loop = setInterval(() => {
        // ECS 상태를 전송합니다.
        ECSStatePublish('channels', server.serverState);
    }, 1000 * 60); // 1분마다 상태 전송

    process.on('SIGINT', function () {
        for (const s of server.serverList) s.disconnect();
        clearInterval(loop);
    });
} else {
    console.log('ECS_ID is not defined');
}
