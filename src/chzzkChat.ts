import ChatServer from 'utils/chat/server';

import { ecsSelect } from 'controllers/log';
import { Content as ChzzkContent } from 'interfaces/API/Chzzk';

import 'utils/procesTuning';

/**
 *
 * @description 알림 작업을 수행하는 스레드로써, 각 알림 스캔 작업을 수행합니다.
 */

const [, file, ECS_ID, ECS_REVISION, ...argv] = process.argv;
// 봇 접두사
const prefix = '@';

if (!ECS_ID) {
    console.log('ECS_ID is not defined');
    process.exit(0);
}

import { Chat } from 'utils/socketClient';

const server = new ChatServer<ChzzkContent>({
    nidAuth: process.env.NID_AUTH,
    nidSession: process.env.NID_SECRET,
    concurrency: 1,
});

server.on('message', chat => {
    const {
        message,
        profile: { userRoleCode },
        extras: { streamingChannelId },
    } = chat;
    const client = server.getServer(streamingChannelId);
    if (!client) return;
    const [userCommand, ...args] = message.split(' ');

    const command = client.commands.find(({ command }) => command.toUpperCase() === userCommand.trim().toUpperCase());
    if (command) {
        chat.reply(command.answer);
    } else {
        if (!message.startsWith(prefix) || userRoleCode == 'common_user') {
            if ('e229d18df2edef8c9114ae6e8b20373a' !== chat.profile.userIdHash) return;
        }
        //
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
                Promise.all([server.saveCommand(streamingChannelId), server.saveUser(streamingChannelId)]).then(() => {
                    chat.reply(`명령어가 저장되었습니다. - ${streamingChannelId}`);
                });
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
                Promise.all([server.loadUser(streamingChannelId), server.loadCommand(streamingChannelId)]).then(() => {
                    chat.reply(`명령어를 다시 불러왔습니다.`);
                });
                break;
            }
            case `${prefix}help`: {
                chat.reply(`https://orefinger.notion.site/Chzzk-Bata-abe6b265f0e74356b300af8fbe76d0cc`);
                break;
            }
            case `${prefix}h`: {
                chat.reply(
                    `a [c] [a] ADD / d [c] - DELETE / l - LIST / s - SAVE / r - RELOAD / h - HELP / server - SERVER`
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
});

server.on('join', channelId => {
    Chat({
        state: 'join',
        target: 'ecs',
        data: { channelId },
    });
});
server.on('reconnect', channelId => {
    Chat({
        state: 'change',
        target: 'ecs',
        data: { channelId },
    });
});
server.on('close', channelId => {
    Chat({
        state: 'leave',
        target: 'ecs',
        data: { channelId },
    });
});

ecsSelect(ECS_REVISION).then(tasks => {
    if (!tasks.length) return;
    const task = tasks.find(task => `${task.id}` === ECS_ID);
    process.env.ECS_ID = ECS_ID;
    process.env.ECS_REVISION = ECS_REVISION;
    process.env.ECS_FAMILY = `${task?.family}`;
    process.env.ECS_PK = `${task?.idx}`;
    process.env.ECS_ROWNUM = `${task?.rownum}`;
});
