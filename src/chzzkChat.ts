import ChatServer from 'utils/chat/server';

import { Content as ChzzkContent } from 'interfaces/API/Chzzk';

import client from 'components/socket/socketClient';
import { CLIENT_EVENT } from 'components/socket/socketInterface';
import { createInterval } from 'utils/inteval';
import 'utils/procesTuning';

/**
 *
 * @description 알림 작업을 수행하는 스레드로써, 각 알림 스캔 작업을 수행합니다.
 */

const [, file, ECS_ID, ECS_REVISION] = process.argv;

// 봇 접두사
const prefix = '@';

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
                Promise.all([server.loadUser(streamingChannelId), server.loadCommand(streamingChannelId)])
                    .then(() => {
                        chat.reply(`명령어를 다시 불러왔습니다.`);
                    })
                    .catch(() => {
                        chat.reply(`Error :: Command Reload Failed. - 관리자에게 문의하세요.`);
                    });
                break;
            }
            case `${prefix}help`: {
                chat.reply(`https://orefinger.notion.site/Chzzk-Bata-abe6b265f0e74356b300af8fbe76d0cc`);
                break;
            }
            case `${prefix}h`: {
                chat.reply(`a [c] [a] ADD / d [c] - DELETE / l - LIST / s - SAVE / r - RELOAD / h - HELP`);
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
    client.emit(CLIENT_EVENT.chatConnect, {
        channelId,
    });
    sendState();
});
server.on('close', channelId => {
    client.emit(CLIENT_EVENT.chatDisconnect, {
        channelId,
    });
    sendState();
});

///////////////////////////////////////////////////////////////////////////////

// 채팅방 입장 명령
client.on(CLIENT_EVENT.chatJoin, ({ noticeId, hashId, liveStatus }) => {
    const { chatChannelId } = liveStatus as ChzzkContent;

    server.addServer(hashId, chatChannelId);
    server.setServerState(hashId, liveStatus);
});

// 채팅방 변경 명령
client.on(CLIENT_EVENT.chatChange, ({ noticeId, hashId, liveStatus }) => {
    const { chatChannelId } = liveStatus as ChzzkContent;
    server.updateChannel(hashId, chatChannelId);
    server.setServerState(hashId, liveStatus);
});

// 채팅방 퇴장 명령
client.on(CLIENT_EVENT.chatLeave, channelId => {
    server.removeServer(channelId);
});

// 채팅방 이동 (채팅방 이동시, 채팅방 정보를 전달합니다.)
client.on(CLIENT_EVENT.chatMove, pid => {
    if (!pid) return;
    for (const chatServer of server.serverList) {
        const { chatChannelId } = chatServer;
        const data = server.getChannelState(chatChannelId);

        // 온라인 이벤트로, 신규 서버에 전달합니다
        if (data) client.emit(CLIENT_EVENT.liveOnline, data, pid);
    }
});

const sendState = () => {
    client.emit(CLIENT_EVENT.chatState, {
        ...server.serverState,
        idx: process.env.ECS_PK,
        revision: process.env.ECS_REVISION,
    });
};

// 데이터가 로딩전이면 작업
createInterval(1000 * 60 * 3, sendState);
