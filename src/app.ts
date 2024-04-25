import AutoLoad from '@fastify/autoload';
import helmet from '@fastify/helmet';
import fastify from 'fastify';
import { addServerRequest, bootTime } from 'utils/serverState';

import { config } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';
import { env } from 'process';

import { ajvFilePlugin } from '@fastify/multipart';
import Multipart from '@fastify/sensible';

import { fork } from 'child_process';

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

import { createECSState } from 'utils/ECS';

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

// 플러그인
server.register(helmet, { global: true });
server.register(Multipart);
server.register(AutoLoad, { dir: join(__dirname, 'plugins') });

// 라우터
server.register(AutoLoad, { dir: join(__dirname, 'routes'), ignorePattern: /.*(test|spec).*/ });

// 서버 요청 카운트
server.addHook('onRequest', (request, reply, done) => {
    addServerRequest();
    done();
});

server.listen({ port: 3000, host: '::' }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    const time = Date.now() - bootTime;
    console.log(`Server started in  ${Math.floor(time / 1000)} (${time}ms)`);
    console.log(`Server listening at ${address}`);

    createECSState().then(isECS => {
        console.log(`ECS: ${isECS}`);
        isECS && startSubtask('/task.js');
        isECS && startSubtask('/chzzkChat.js');
    });
});

/**
 * 보조 서비스를 시작함
 * @param target
 */
const startSubtask = (target: `/${string}`) => {
    const child = fork(__dirname + target, {
        env: {
            ECS_PK: process.env.ECS_PK,
            ECS_ID: process.env.ECS_ID,
            ECS_REVISION: process.env.ECS_REVISION,
            ECS_FAMILY: process.env.ECS_FAMILY,
        },
    });
    child.on('close', (code: number) => {
        stopSubtask(target, code);
    });
    process.on('SIGINT', child.kill);
};

/**
 * 서비스가 강제 종료되면, 다시 시작합니다.
 * @param code
 */
const stopSubtask = (target: `/${string}`, code: number) => {
    if (code !== 0) {
        console.error(`task.js exited with code ${code}`);
        startSubtask(target);
    }
};

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
    process.exit();
});
