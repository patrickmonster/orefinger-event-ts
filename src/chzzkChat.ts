import ChatServer from 'utils/chat/server';

import { Content as ChzzkContent } from 'interfaces/API/Chzzk';

import client from 'components/socket/socketClient';
import { CLIENT_EVENT } from 'components/socket/socketInterface';
import { authTypes } from 'controllers/auth';
import { createInterval } from 'utils/inteval';
import 'utils/procesTuning';

import { upsertChatPermission } from 'controllers/chat/chzzk';
import { ENCRYPT_KEY, sha256 } from 'utils/cryptoPw';

/**
 *
 * @description 알림 작업을 수행하는 스레드로써, 각 알림 스캔 작업을 수행합니다.
 */

const [, file, ECS_ID, ECS_REVISION] = process.argv;

// 봇 접두사
const prefix = '@';

const server = new ChatServer<ChzzkContent>();

server.on('message', chat => {
    const {
        message,
        profile: { userRoleCode },
        extras: { streamingChannelId },
    } = chat;

    const client = server.getServer(streamingChannelId);
    if (!client || !message) return;
    const [userCommand, ...args] = message.split(' ');

    const command = client.commands.find(({ command }) => command.toUpperCase() === userCommand.trim().toUpperCase());

    if (command) {
        chat.reply(command.answer);
    } else {
        if (!message.startsWith(prefix) || userRoleCode == 'common_user') {
            if ('e229d18df2edef8c9114ae6e8b20373a' !== chat.profile.userIdHash) return;
        }

        switch (userCommand) {
            case `${prefix}`: {
                // 명령어 리스트 https://r.orefinger.click/bot/572729aeb2631be6b2483adf083efee6
                chat.reply(`명령어 리스트 https://r.orefinger.click/bot/${streamingChannelId}`);
                break;
            }
            case `${prefix}AUTH`: {
                const [user, key] = args;
                if (!key || !user) {
                    chat.reply('인증키가 없어욧! - AUTH [인증키]');
                    return;
                }
                const origin = sha256(`${user}:${streamingChannelId}`, ENCRYPT_KEY).replace(/[^a-zA-Z0-9]/g, '');
                if (origin !== key) {
                    chat.reply('초오오비상!! 누가 해킹하려고 해욧! (대충 인증키가 틀렸다는거에요)');
                    return;
                }

                upsertChatPermission(user, streamingChannelId, userRoleCode)
                    .then(() => {
                        chat.reply('뿌뿌루 빰빰🎉 관리자가 등록되었어요!📌');
                    })
                    .catch(() => {
                        chat.reply('앗...! 등록에 실패했어요! 관리자에게 문의해주세요!📌 (아마 코드가 없는거 같아요)');
                    });

                break;
            }
            case `${prefix}a`:
            case `${prefix}A`:
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
            case `${prefix}d`:
            case `${prefix}D`:
            case `${prefix}delete`: {
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
            case `${prefix}h`:
            case `${prefix}H`:
            case `${prefix}help`: {
                chat.reply(`도움말 https://r.orefinger.click/help?t=bot`);
                break;
            }
            case `${prefix}인사`: {
                chat.reply(`안녕하세요! 저는 디스코드에서 방송알림을 전송하고 있어요...! 🎉`);
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
client.on(CLIENT_EVENT.chatJoin, ({ noticeId, hashId, liveStatus }, freeServer) => {
    const { chatChannelId } = liveStatus as ChzzkContent;
    if (freeServer == process.env.ECS_PK) {
        server.addServer(hashId, chatChannelId);
        server.setServerState(hashId, liveStatus);
    }
});

client.on(CLIENT_EVENT.chatUpdate, (hashId: string) => {
    if (server.hasServer(hashId)) {
        server.loadUser(hashId);
        server.loadCommand(hashId);
    }
});

// 채팅방 변경 명령
client.on(CLIENT_EVENT.chatChange, ({ noticeId, hashId, liveStatus }, freeServer) => {
    const { chatChannelId } = liveStatus as ChzzkContent;
    if (freeServer == process.env.ECS_PK) {
        server.updateChannel(hashId, chatChannelId);
        server.setServerState(hashId, liveStatus);
    }
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
        const data = server.getState(chatChannelId);

        // 온라인 이벤트로, 신규 서버에 전달합니다
        if (data) client.emit(CLIENT_EVENT.liveOnline, data, pid);
    }
});

client.on(CLIENT_EVENT.chatAuth, async (nidAuth, nidSession) => {
    server.init(nidAuth, nidSession);

    console.log('SET AUTH', nidAuth, nidSession);

    for (const chatServer of server.serverList) {
        await chatServer.reconnect();
    }
});

const sendState = () => {
    client.emit(CLIENT_EVENT.chatState, {
        ...server.serverState,
        idx: process.env.ECS_PK,
        revision: process.env.ECS_REVISION,
    });
    // redis
};

authTypes(true, 13).then(([type]) => {
    if (!type) return;

    console.log('SET AUTH', type.scope, type.client_sc);

    server.init(type.scope, type.client_sc);
});

// 데이터가 로딩전이면 작업
createInterval(1000 * 60 * 3, sendState);
