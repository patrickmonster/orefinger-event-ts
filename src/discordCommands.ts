/**
 * @file discordCommands.ts
 * @description 디스코드 커맨드를 자동으로 등록합니다.
 *
 */

import { config } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';
import { env, exit } from 'process';

const envDir = join(env.PWD || __dirname, `/.env`);
if (existsSync(envDir)) {
    config({ path: envDir });
} else {
    // 로컬버전 - 운영 환경에서는 빌드시 자동으로 .env 파일을 생성함.
    config({
        path: join(env.PWD || __dirname, `/src/env/.env.${env.NODE_ENV}`),
    });
}

import { api as commandOptions } from './interactions/app';

const bigintConvert = (key: string, value: any) => (typeof value === 'bigint' ? value.toString() : value);
console.log('api] ', JSON.stringify(commandOptions, bigintConvert));

exit(0);
// api.get(`/applications/${env.DISCORD_CLIENT_ID}/commands`).then(res => {
//     console.log('명령어 조회]', res);
// });
// api.put(`/applications/${env.DISCORD_CLIENT_ID}/commands`, JSON.parse(JSON.stringify(commandOptions, bigintConvert)))
//     .then(res => {
//         console.log('명령어 등록]', res);

//         process.exit(0);
//     })
//     .catch(err => {
//         console.error('명령어 등록 실패]', err.response.data);
//         process.exit(1);
//     });
