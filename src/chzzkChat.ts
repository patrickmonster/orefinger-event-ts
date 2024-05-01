import { ChatLog, insertChatQueue } from 'controllers/chat/chzzk';
import { ChatDonation, ChatMessage } from 'interfaces/chzzk/chat';
import { LoopRunQueue, ParseInt } from 'utils/object';

import { ECSStatePublish, LiveStatePublish } from 'utils/redis';
import { ECSStateSubscribe, LiveStateSubscribe } from 'utils/redisBroadcast';
import ChatServer from './utils/chat/server';

import { ecsSelect } from 'controllers/log';
import { Content as ChzzkContent } from 'interfaces/API/Chzzk';

import { getECSSpaceId } from 'utils/ECS';
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

const appendChat = ({
    id,
    message,
    hidden,
    extras: { osType },
    profile: { userIdHash },
    cid,
}: ChatMessage | ChatDonation) => {
    addQueue({
        channel_id: cid,
        message_id: id,
        message,
        user_id: userIdHash,
        os_type: osType || '-',
        hidden_yn: hidden ? 'Y' : 'N',
    });
};

const [, file, ECS_ID, ECS_REVISION, ...argv] = process.argv;
// 봇 접두사
const prefix = '@';

if (ECS_ID) {
    const server = new ChatServer<ChzzkContent>({
        nidAuth: process.env.NID_AUTH,
        nidSession: process.env.NID_SECRET,
        concurrency: 1,
        onMessage: chat => {
            appendChat(chat);
            const {
                message,
                profile: { userRoleCode },
                extras: { streamingChannelId },
            } = chat;
            const client = server.getServer(streamingChannelId);
            if (!client) return;
            const [userCommand, ...args] = message.split(' ');

            const command = client.commands.find(({ command }) => command === userCommand.trim());
            if (command) {
                chat.reply(command.answer);
            } else {
                if (!message.startsWith(prefix) || userRoleCode == 'common_user') {
                    if ('e229d18df2edef8c9114ae6e8b20373a' !== chat.profile.userIdHash) {
                        return;
                    }
                }
                switch (userCommand) {
                    case `${prefix}add`: {
                        const [question, ...answer] = args;

                        if (!question || !answer.length) {
                            chat.reply('명령어를 입력해주세요. - add [명령어] [응답]');
                            return;
                        }

                        const idx = client.addCommand({
                            answer: answer.join(' '),
                            command: question.trim(),
                        });

                        chat.reply(`명령어가 ${idx != -1 ? '교체' : '추가'}되었습니다. - ${question}`);
                        break;
                    }
                    case `${prefix}remove`: {
                        const [question] = args;

                        if (!question) {
                            chat.reply('명령어를 입력해주세요. - remove [명령어]');
                            return;
                        }

                        const idx = client.commands.findIndex(({ command }) => command === question.trim());
                        if (idx === -1) {
                            chat.reply('해당 명령어가 없습니다.');
                            return;
                        }

                        client.commands.splice(idx, 1);
                        chat.reply(`명령어가 삭제되었습니다. - ${question}`);
                        break;
                    }
                    case `${prefix}list`: {
                        chat.reply(
                            client.commands
                                .map(({ command }) => command)
                                .join(', ')
                                .slice(0, 2000)
                        );
                        break;
                    }
                    case `${prefix}reload`: {
                        server.reloadCommand(streamingChannelId);
                        chat.reply('명령어를 다시 불러옵니다... 적용까지 1분...');
                        break;
                    }
                    case `${prefix}help`: {
                        chat.reply(
                            `${prefix}add [명령어] [응답] - 명령어 추가 / ${prefix}remove [명령어] - 명령어 삭제 `
                        );
                        break;
                    }
                    case `${prefix}server`: {
                        const { count, userCount } = server.serverState;
                        chat.reply(
                            `현재 서버 : ${getECSSpaceId()} / 연결된 서버 : ${(count || 0).toLocaleString()} / ${(
                                userCount || 0
                            ).toLocaleString()}`
                        );
                        break;
                    }
                    default:
                        break;
                }
            }
        },
        onClose: channelId => {
            ECSStatePublish('leave', {
                ...server.serverState,
                hash_id: channelId,
            });
        },
    });

    ecsSelect(ECS_REVISION).then(tasks => {
        if (!tasks.length) return;
        const task = tasks.find(task => `${task.id}` === ECS_ID);
        process.env.ECS_ID = ECS_ID;
        process.env.ECS_REVISION = ECS_REVISION;
        process.env.ECS_FAMILY = `${task?.family}`;
        process.env.ECS_PK = `${task?.idx}`;

        LiveStateSubscribe('*', ({ hashId, liveStatus }) => {
            server.updateLiveState(hashId, liveStatus);
        });

        // -- 채널 이동명령
        LiveStateSubscribe('move', ({ hashId, liveStatus }) => {
            const targetId = getECSSpaceId();
            if (targetId !== process.env.ECS_PK) return; // 자신의 서버가 아닌 경우

            const { chatChannelId } = liveStatus as ChzzkContent;
            server.addServer(hashId, chatChannelId);
            server.setServerState(hashId, liveStatus);

            ECSStatePublish('join', {
                ...server.serverState,
                hash_id: hashId,
            });
        });

        LiveStateSubscribe('change', ({ hashId, liveStatus }) => {
            const { chatChannelId } = liveStatus as ChzzkContent;
            server.updateChannel(hashId, chatChannelId);
            server.setServerState(hashId, liveStatus);
        });

        LiveStateSubscribe('online', ({ targetId, hashId, liveStatus }) => {
            const { chatChannelId } = liveStatus as ChzzkContent;
            if (targetId !== process.env.ECS_PK) return; // 자신의 서버가 아닌 경우
            server.addServer(hashId, chatChannelId);
            server.setServerState(hashId, liveStatus);

            ECSStatePublish('join', {
                ...server.serverState,
                hash_id: hashId,
            });
        });

        LiveStateSubscribe('offline', ({ hashId }) => {
            server.getServer(hashId)?.disconnect();
        });

        // -- 새로운 채널 입장 알림
        ECSStateSubscribe('join', ({ hash_id, id }) => {
            if (id == process.env.ECS_PK) return; // 자신의 서버인 경우

            if (hash_id) server.removeServer(hash_id).catch(console.error);
        });

        // -- 채널 연결 *(명령)
        ECSStateSubscribe('connect', ({ hash_id, id }) => {
            if (id !== process.env.ECS_PK) return; // 자신의 서버가 아닌 경우
            hash_id && server.addServer(hash_id);
        });

        // if (task?.rownum === 1) {
        //     selectChatServer(4).then(async chats => {
        //         for (const { hash_id: hashId } of chats) {
        //             server.addServer(hashId);
        //             ECSStatePublish('join', {
        //                 ...(await server.api.status(hashId)),
        //                 hash_id: hashId,
        //             });
        //         }
        //     });
        // }
    });

    const loop = setInterval(() => {
        // ECS 상태를 전송합니다.
        ECSStatePublish('channels', server.serverState);
    }, 1000 * 60); // 1분마다 상태 전송

    process.on('SIGINT', function () {
        for (const s of server.serverList) {
            const state = server.moveServer(s.roomId);
            if (state)
                LiveStatePublish('move', {
                    noticeId: ParseInt(`${process.env.ECS_PK}`),
                    hashId: s.roomId,
                    liveStatus: state,
                    targetId: getECSSpaceId(), // ECS ID
                });
        }
        clearInterval(loop);
    });
} else {
    console.log('ECS_ID is not defined');
}
