import fastify from 'fastify';
import AutoLoad from '@fastify/autoload';
import helmet from '@fastify/helmet';

import { join } from 'path';
import { env } from 'process';
import { existsSync } from 'fs';
import { config } from 'dotenv';

import fs, { promises } from 'fs';

import { error as errorLog } from './utils/logger';

const envDir = join(env.PWD || __dirname, `/.env`);
if (existsSync(envDir)) {
    config({ path: envDir });
} else {
    // 로컬버전 - 운영 환경에서는 빌드시 자동으로 .env 파일을 생성함.
    config({
        path: join(env.PWD || __dirname, `/src/env/.env.${env.NODE_ENV}`),
    });
}

//////////////////////////////////////////////////////////////////////
// 환경변수

const server = fastify({
    // logger: env.NODE_ENV != 'prod'
    logger: {
        transport: {
            target: '@fastify/one-line-logger',
        },
    },
});

server.register(helmet, { global: true });
server.register(AutoLoad, { dir: join(__dirname, 'plugins') });
server.register(AutoLoad, { dir: join(__dirname, 'routes'), ignorePattern: /.*(test|spec).*/ });

if (!process.env.MASTER_KEY)
    // 개발 백도어
    server.register(require('@fastify/static'), {
        root: path.join(__dirname, 'public'),
        prefix: '/dev/',
    });

server.listen({ port: 3000, host: '::' }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});

//////////////////////////////////////////////////////////////////////
// 프로세서 모듈

process.on('unhandledRejection', (error, promise) => {
    errorLog('unhandledRejection', error);
    console.error('unhandledRejection', error);
});
process.on('uncaughtException', (error, promise) => {
    errorLog('uncaughtException', error);
    console.error('uncaughtException', error);
});

process.on('SIGINT', function () {
    console.error(`=============================${process.pid}번 프로세서가 종료됨=============================`);
    process.exit();
});
