import { config } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';
import { env } from 'process';

const envDir = join(env.PWD || __dirname, `/.env`);
if (existsSync(envDir)) {
    config({ path: envDir });
} else {
    // 로컬버전 - 운영 환경에서는 빌드시 자동으로 .env 파일을 생성함.
    config({
        path: join(env.PWD || __dirname, `/src/env/.env.${env.NODE_ENV}`),
    });
}

import ChatServer from 'utils/chat/server';

import { Content as ChzzkContent } from 'interfaces/API/Chzzk';

import 'utils/procesTuning';

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
            case `${prefix}s`:
            case `${prefix}S`:
            case `${prefix}save`: {
                chat.reply(`명령어를 저장중...`);
                Promise.all([server.saveCommand(streamingChannelId), server.saveUser(streamingChannelId)]).then(() => {
                    chat.reply(`명령어가 저장되었습니다. - ${streamingChannelId}`);
                });
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
            case `${prefix}l`:
            case `${prefix}L`:
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
            case `${prefix}R`:
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
                chat.reply(`https://r.orefinger.click/help?t=bot`);
                break;
            }
            case `${prefix}h`:
            case `${prefix}H`: {
                chat.reply(`a [c] [a] ADD / d [c] - DELETE / l - LIST / s - SAVE / r - RELOAD / h - HELP`);
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
    console.log('join', channelId);
});
server.on('close', channelId => {
    console.log('close', channelId);
});

///////////////////////////////////////////////////////////////////////////////

server.addServer('e229d18df2edef8c9114ae6e8b20373a');
