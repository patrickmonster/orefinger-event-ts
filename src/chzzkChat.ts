import { ParseInt } from 'utils/object';

import redis, { ECSStatePublish, LiveStatePublish, REDIS_KEY } from 'utils/redis';
import client, { ECSStateSubscribe, LiveStateSubscribe } from 'utils/redisBroadcast';
import ChatServer from './utils/chat/server';

import { ecsSelect } from 'controllers/log';
import { Content as ChzzkContent } from 'interfaces/API/Chzzk';

import { getECSSpaceId } from 'utils/ECS';
import { createInterval } from 'utils/inteval';
import 'utils/procesTuning';

/**
 *
 * @description 알림 작업을 수행하는 스레드로써, 각 알림 스캔 작업을 수행합니다.
 */

const [, file, ECS_ID, ECS_REVISION, ...argv] = process.argv;
// 봇 접두사
const prefix = '@';

if (ECS_ID) {
    const server = new ChatServer<ChzzkContent>({
        nidAuth: process.env.NID_AUTH,
        nidSession: process.env.NID_SECRET,
        concurrency: 1,
        onMessage: chat => {
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
                    case `${prefix}a`:
                    case `${prefix}add`: {
                        const [question, ...answer] = args;
                        const command = question.trim();

                        if (!question || !answer.length) {
                            chat.reply('명령어를 입력해주세요. - add [명령어] [응답]');
                            return;
                        }

                        if (command.startsWith(prefix)) {
                            chat.reply(`명령어는 접두사(${prefix})로 시작할 수 없습니다.`);
                            return;
                        }

                        const idx = client.addCommand({
                            answer: answer.join(' '),
                            command,
                        });

                        chat.reply(`명령어가 ${idx != -1 ? '교체' : '추가'}되었습니다. - ${command}`);
                        break;
                    }
                    case `${prefix}s`:
                    case `${prefix}save`: {
                        chat.reply(`명령어를 저장중...`);
                        Promise.all([server.saveCommand(streamingChannelId), server.saveUser(streamingChannelId)]).then(
                            () => {
                                chat.reply(`명령어가 저장되었습니다. - ${streamingChannelId}`);
                            }
                        );
                        break;
                    }
                    case `${prefix}d`:
                    case `${prefix}delete`:
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
                    case `${prefix}l`:
                    case `${prefix}list`: {
                        chat.reply(
                            client.commands
                                .map(({ command }) => command)
                                .join(', ')
                                .slice(0, 2000)
                        );
                        break;
                    }
                    case `${prefix}r`:
                    case `${prefix}reload`: {
                        chat.reply('명령어를 다시 불러옵니다... 적용까지 1분...');
                        Promise.all([server.loadUser(streamingChannelId), server.loadCommand(streamingChannelId)]).then(
                            () => {
                                chat.reply(`명령어를 다시 불러왔습니다.`);
                            }
                        );
                        break;
                    }
                    case `${prefix}help`: {
                        chat.reply(
                            `${prefix}add [명령어] [응답] - 명령어 추가 / ${prefix}remove [명령어] - 명령어 삭제 `
                        );
                        break;
                    }
                    case `${prefix}h`: {
                        chat.reply(
                            `a [c] [a] ADD / r [c] - DELETE / l - LIST / s - SAVE / r - RELOAD / h - HELP / server - SERVER / help - HELP`
                        );
                        break;
                    }
                    case `${prefix}server`: {
                        const { count, userCount } = server.serverState;
                        chat.reply(
                            `현재 서버 : ${process.env.ECS_PK} / 연결된 서버 : ${(count || 0).toLocaleString()} / ${(
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

    /*
     * 채널 상태를 redis 에 업데이트 합니다.
     */
    const updateChannelState = () => {
        const servers = server.serverList;
        const list = [];
        for (const server of servers) {
            list.push({
                hash_id: server.roomId,
                host: server.host,
                chatChannelId: server.chatChannelId,
            });
        }

        redis.set(
            REDIS_KEY.CHAT.CHZZK(`${process.env.ECS_PK}`),
            JSON.stringify({
                serverState: server.serverState,
                list,
            }),
            { EX: 60 * 60 }
        );
    };

    ecsSelect(ECS_REVISION).then(tasks => {
        if (!tasks.length) return;
        const task = tasks.find(task => `${task.id}` === ECS_ID);
        process.env.ECS_ID = ECS_ID;
        process.env.ECS_REVISION = ECS_REVISION;
        process.env.ECS_FAMILY = `${task?.family}`;
        process.env.ECS_PK = `${task?.idx}`;
        process.env.ECS_ROWNUM = `${task?.rownum}`;

        // test server
        if (task?.rownum == 1) {
            server.addServer('e229d18df2edef8c9114ae6e8b20373a');
        }

        /**
         * 채널 이동 명령
         *  - 가장 여유로운 서버가 본인의 서버인 경우 작업을 실행 합니다.
         */
        LiveStateSubscribe('move', async ({ hashId, liveStatus }) => {
            const targetId = getECSSpaceId();
            if (targetId !== `${task?.idx}`) return; // 자신의 서버가 아닌 경우
            if (!liveStatus) liveStatus = await server.getChannelState(hashId);
            const { chatChannelId } = liveStatus;
            server.addServer(hashId, chatChannelId);
            server.setServerState(hashId, liveStatus);
            ECSStatePublish('join', {
                ...server.serverState,
                hash_id: hashId,
            });
        });

        /**
         * 공지사항을 전송합니다.
         */
        LiveStateSubscribe('notice', ({ hashId, liveStatus }) => {
            if (hashId != '-') {
                server.send(hashId, liveStatus as string);
            } else {
                server.sendAll(liveStatus as string);
            }
        });

        LiveStateSubscribe('change', ({ hashId, liveStatus }) => {
            if (server.hasServer(hashId)) {
                const { chatChannelId } = liveStatus;
                server.updateChannel(hashId, chatChannelId);
                server.setServerState(hashId, liveStatus);
            }
        });

        LiveStateSubscribe('online', ({ targetId, hashId, liveStatus }) => {
            if (targetId !== process.env.ECS_PK) return; // 자신의 서버가 아닌 경우
            const { chatChannelId } = liveStatus;
            server.addServer(hashId, chatChannelId);
            server.setServerState(hashId, liveStatus);
            ECSStatePublish('join', {
                ...server.serverState,
                hash_id: hashId,
            });
        });

        LiveStateSubscribe('offline', ({ hashId }) => {
            server.removeServer(hashId);
        });

        // -- 새로운 채널 입장 알림
        ECSStateSubscribe('join', ({ hash_id, id }) => {
            if (id == process.env.ECS_PK) return; // 자신의 서버인 경우
            if (hash_id) server.removeServer(hash_id);
        });

        // -- 채널
        ECSStateSubscribe('connect', ({ hash_id, id }) => {
            if (id !== process.env.ECS_PK) return; // 자신의 서버가 아닌 경우
            hash_id && server.addServer(hash_id);
            updateChannelState();
        });

        /**
         * 새로운 서버가 시작함
         */
        ECSStateSubscribe('new', ({ hash_id, revision }) => {
            // ECS ID 가 다를경우
            if (revision === process.env.ECS_REVISION || hash_id != process.env.ECS_ROWNUM) return; // 자신의 버전과 맞을경우
            for (const s of server.serverList) {
                LiveStatePublish('move', {
                    noticeId: ParseInt(`${process.env.ECS_PK}`),
                    hashId: s.roomId,
                    liveStatus: null,
                    targetId: getECSSpaceId(), // ECS ID
                });
            }
        });
    });

    client.on('connect', () => {
        ECSStatePublish('new', {
            ...server.serverState,
            hash_id: process.env.ECS_ROWNUM,
        });

        createInterval(() => {
            // ECS 상태를 전송합니다.
            ECSStatePublish('channels', server.serverState);
            updateChannelState();
        }, 1000 * 60);

        // 초기상태 전송
        ECSStatePublish('channels', server.serverState);
    });
} else {
    console.log('ECS_ID is not defined');
}
