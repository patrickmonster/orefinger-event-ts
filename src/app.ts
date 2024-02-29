import AutoLoad from '@fastify/autoload';
import helmet from '@fastify/helmet';
import fastify from 'fastify';

import { config } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';
import { env } from 'process';

import { ajvFilePlugin } from '@fastify/multipart';

import axios from 'axios';
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
    ajv: {
        plugins: [ajvFilePlugin],
    },
});

server.register(helmet, { global: true });

server.register(AutoLoad, { dir: join(__dirname, 'plugins') });
server.register(AutoLoad, { dir: join(__dirname, 'routes'), ignorePattern: /.*(test|spec).*/ });

const bootTime = Date.now();

server.listen({ port: 3000, host: '::' }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    const time = Date.now() - bootTime;
    console.log(`Server started in  ${Math.floor(time / 1000)} (${time}ms)`);
    console.log(`Server listening at ${address}`);

    // GET ecs state
    if (process.env.ECS_CONTAINER_METADATA_URI) {
        const { ECS_CONTAINER_METADATA_URI } = process.env;
        console.log(`ECS: ${ECS_CONTAINER_METADATA_URI}`);
        axios
            .get<{}>(`${ECS_CONTAINER_METADATA_URI}/task`)
            .then(({ data }) => {
                console.log(`ECS STATE ::`, data);
            })
            .catch(e => {
                console.error(`ECS STATE ERROR ::`, e);
            });
    }

    if (process.env.MASTER_KEY)
        process.nextTick(() => {
            // 배치 모듈
            import('bat/youtube');
            import('bat/chzzk');
            import('bat/afreeca');
        });
});

const ecsState = setInterval(() => {
    const ecs = process.env.ECS_CONTAINER_METADATA_URI;
    if (ecs) {
        console.log(`ECS: ${ecs}`);
        clearInterval(ecsState);
    }
}, 1000 * 60); // 1분마다 실행
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
    clearInterval(ecsState);
    process.exit();
});
