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

import { messageCreate } from 'components/discord';
import { createActionRow, createSuccessButton } from 'utils/discord/component';

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

// 1125273780063846441

messageCreate('1125273780063846441', {
    components: [
        createActionRow(
            createSuccessButton('notice logs 46', {
                label: '방송이력',
            })
        ),
    ],
});
