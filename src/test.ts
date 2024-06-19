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

import { channelShorts } from 'components/user/youtube';

channelShorts('UCrWBTUXbWG3VjNas9mt9tHw').then(console.log).catch(console.error);
// channelVideos('UCrWBTUXbWG3VjNas9mt9tHw').then(console.log).catch(console.error);
