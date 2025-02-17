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
import { sixWeek } from 'utils/createCalender';
// console.log(createCalender(new Date(), new Date()));

seelctNoticeHistory(46).then(data => {
    console.log(sixWeek(new Date(), ...data.map(({ live_at, title }) => new Date(live_at))));
});
