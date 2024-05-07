// import { config } from 'dotenv';
// import { existsSync } from 'fs';
// import { join } from 'path';
// import { env } from 'process';

// const envDir = join(env.PWD || __dirname, `/.env`);
// if (existsSync(envDir)) {
//     config({ path: envDir });
// } else {
//     // 로컬버전 - 운영 환경에서는 빌드시 자동으로 .env 파일을 생성함.
//     config({
//         path: join(env.PWD || __dirname, `/src/env/.env.${env.NODE_ENV}`),
//     });
// }

import client from 'utils/socketClient';

client.on('connect', () => {
    console.log('connect');
});
client.on('disconnect', () => {
    console.log('disconnect');
});
client.on('error', err => {
    console.log('error', err);
});
client
    .on('status', (...args) => {
        console.log('status', args);
    })
    .on('message', (...args) => {
        console.log('message', args);
    });

client.emit('status', 'test');

// import ChatServer from 'utils/chat/server';

// const server = new ChatServer<Content>({
//     nidAuth: process.env.NID_AUTH,
//     nidSession: process.env.NID_SECRET,
//     concurrency: 1,
//     onMessage: chat => {
//         const {
//             id,
//             message,
//             profile: { userRoleCode, nickname },
//             extras: { streamingChannelId },
//         } = chat;

//         const client = server.getServer(streamingChannelId);
//         if (!client) return;
//         const [userCommand, ...args] = message.split(' ');
//         console.log('CHAT ::', streamingChannelId, id, nickname, '::', message, userCommand);

//         const command = client.commands.find(({ command }) => command === userCommand);
//         if (command) {
//             console.log('COMMAND ::', command.command, '::', command.answer);
//             chat.reply(command.answer);
//         } else {
//             if (!message.startsWith(prefix) || userRoleCode == 'common_user') {
//                 if ('e229d18df2edef8c9114ae6e8b20373a' !== chat.profile.userIdHash) {
//                     return;
//                 }
//             }

//             switch (userCommand) {
//                 case `${prefix}add`: {
//                     const [question, ...answer] = args;

//                     if (!question || !answer.length) {
//                         chat.reply('명령어를 입력해주세요. - add [명령어] [응답]');
//                         return;
//                     }

//                     const idx = client.addCommand({
//                         answer: answer.join(' '),
//                         command: question,
//                     });

//                     chat.reply(`명령어가 ${idx != -1 ? '교체' : '추가'}되었습니다. - ${question}`);
//                     break;
//                 }
//                 case `${prefix}remove`: {
//                     const [question] = args;

//                     if (!question) {
//                         chat.reply('명령어를 입력해주세요. - remove [명령어]');
//                         return;
//                     }

//                     const idx = client.commands.findIndex(({ command }) => command === question);
//                     if (idx === -1) {
//                         chat.reply('해당 명령어가 없습니다.');
//                         return;
//                     }

//                     client.commands.splice(idx, 1);
//                     chat.reply(`명령어가 삭제되었습니다. - ${question}`);
//                     break;
//                 }
//                 case `${prefix}list`: {
//                     chat.reply(
//                         client.commands
//                             .map(({ command }) => command)
//                             .join(', ')
//                             .slice(0, 2000)
//                     );
//                     break;
//                 }
//                 case `${prefix}reload`: {
//                     server.loadCommand(streamingChannelId);
//                     chat.reply('명령어를 다시 불러옵니다... 적용까지 1분...');
//                     break;
//                 }
//                 case `${prefix}help`: {
//                     chat.reply(
//                         `${prefix}add [명령어] [응답] - 명령어 추가 / ${prefix}remove [명령어] - 명령어 삭제 / ${prefix}list - 명령어 목록 / ${prefix}help - 도움말 / https://orefinger.notion.site
//                         `.trim()
//                     );
//                     break;
//                 }
//                 default:
//                     break;
//             }
//         }
//     },
// });

// server.addServer('e229d18df2edef8c9114ae6e8b20373a');

// -- 채널 변경
// redisBroadcast
//     .subscribe(REDIS_KEY.SUBSCRIBE.LIVE_STATE('change'), (message: string) => {
//         const { hashId, liveStatus } = JSON.parse(message);
//         const { chatChannelId } = liveStatus as ChzzkContent;

//         server.getServer(hashId)?.updateChannel(chatChannelId, hashId);
//     })
//     .catch(console.error);

// // -- 온라인
// redisBroadcast
//     .subscribe(REDIS_KEY.SUBSCRIBE.LIVE_STATE('online'), async (message: string) => {
//         const { type, id, targetId, noticeId, hashId, liveStatus } = JSON.parse(message);
//         const { chatChannelId } = liveStatus as ChzzkContent;
//         // if (targetId !== ECS_PK) return; // 자신의 서버가 아닌 경우

//         await server.addServer(hashId, chatChannelId);
//     })
//     .catch(console.error);

// // -- 오프라인
// redisBroadcast
//     .subscribe(REDIS_KEY.SUBSCRIBE.LIVE_STATE('offline'), (message: string) => {
//         const { hashId } = JSON.parse(message);
//         server.getServer(hashId)?.disconnect();
//     })
// .catch(console.error);

// for (const { hash_id: hashId } of chats) {
//     server.addServer(hashId);
//     ECSStatePublish('join', {
//         ...server.serverState,
//         hash_id: hashId,
//     });
// }
