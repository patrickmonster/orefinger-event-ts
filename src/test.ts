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

import { seelctNoticeHistory } from 'controllers/notice';
import { sixWeekBig } from 'utils/createCalender';

// console.log(createCalender(new Date(), new Date()));

// seelctNoticeHistory(46).then(data => {
//     console.log(
//         sixWeekBig(
//             {
//                 time: new Date(),
//                 textLength: 1,
//             },
//             ...data.map(({ live_at, title }) => ({
//                 time: new Date(live_at),
//                 title,
//             }))
//         )
//     );
// });

const a = async () => {
    const list = await seelctNoticeHistory(46);

    const games = list.reduce((acc, { game }) => {
        acc[game] = (acc[game] || 0) + 1;
        return acc;
    }, {} as any);

    return {
        color: 0xffca52,
        description: `
최근 ${list.length}개의 방송이력이 있습니다.
${
    Object.keys(games)
        .map(key => ` - ${key} 방송 ${games[key]}회`)
        .join('\n') || '방송이력이 없습니다.'
}
\`\`\`ansi
${sixWeekBig(
    {
        time: new Date(),
        textLength: 15,
    },
    ...list.map(({ live_at, title }) => ({
        time: new Date(live_at),
        title,
    }))
)}
\`\`\``,
    };
};

a().then(console.log);
