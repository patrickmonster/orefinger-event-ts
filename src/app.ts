import AutoLoad from '@fastify/autoload';
import helmet from '@fastify/helmet';
import fastify from 'fastify';

import { config } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';
import { env } from 'process';

import { ajvFilePlugin } from '@fastify/multipart';
import Multipart from '@fastify/sensible';

import axios from 'axios';
import { ECStask } from 'interfaces/ecs';
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

import { ecsPing, ecsSet } from 'controllers/log';

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

const bootTime = Date.now();

let insertId = 0;

// 플러그인
server.register(helmet, { global: true });
server.register(Multipart);
server.register(AutoLoad, { dir: join(__dirname, 'plugins') });

// 라우터
server.register(AutoLoad, { dir: join(__dirname, 'routes'), ignorePattern: /.*(test|spec).*/ });

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
            .get<ECStask>(`${ECS_CONTAINER_METADATA_URI}/task`)
            .then(async ({ data }) => {
                const { Family, Revision, TaskARN } = data;
                const [, name, id] = TaskARN.split('/');

                console.log(`ECS STATE ::`, data.Containers);
                process.env.ECS_ID = id;
                process.env.ECS_REVISION = Revision;
                process.env.ECS_FAMILY = Family;

                ecsSet(id, Revision, Family)
                    .then(({ insertId: id }) => {
                        insertId = id;
                    })
                    .catch(e => {});
            })
            .catch(e => {
                console.error(`ECS STATE ERROR ::`, e);
            });
    }

    if (process.env.MASTER_KEY) {
        process.nextTick(() => {
            // 배치 모듈
            import('bat');
        });

        // discord.get('/gateway/bot');
    }
});
const ping = setInterval(() => {
    if (process.env.ECS_IDX) {
        ecsPing(process.env.ECS_IDX);
    }
}, 1000 * 60 * 5); // 5분마다 실행
//////////////////////////////////////////////////////////////////////
// 프로세서 모듈

process.on('unhandledRejection', (err, promise) => {
    errorLog('unhandledRejection', JSON.stringify(err, Object.getOwnPropertyNames(err)));
    console.error('unhandledRejection', err);
});
process.on('uncaughtException', (err, promise) => {
    errorLog('uncaughtException', JSON.stringify(err, Object.getOwnPropertyNames(err)));
    console.error('uncaughtException', err);
});

process.on('SIGINT', function () {
    console.error(`=============================${process.pid}번 프로세서가 종료됨=============================`);
    clearInterval(ping);
    process.exit();
});
