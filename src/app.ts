import AutoLoad from '@fastify/autoload';
import helmet from '@fastify/helmet';
import fastify from 'fastify';

import { config } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';
import { env } from 'process';

import { ajvFilePlugin } from '@fastify/multipart';
import Multipart from '@fastify/sensible';

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

import { fork } from 'child_process';
import socket, { ECS } from 'components/socket/socketServer';
import { createECSState } from 'utils/ECS';
import 'utils/procesTuning';
import { addServerRequest, bootTime } from 'utils/serverState';

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
});

server.addHook('onClose', async () => {
    socket.close();
});

//////////////////////////////////////////////////////////////////////
// 프로세서 모듈

createECSState().then(isECS => {
    console.log(`ECS: ${isECS}`);
    if (isECS) {
        startSubtask('/task.js');
        startSubtask('/chzzkChat.js');

        ECS.serverSideEmit('new', {
            // ECS 서버가 시작되었음을 알림
            id: process.env.ECS_ID,
            revision: process.env.ECS_REVISION,
            family: process.env.ECS_FAMILY,
            pk: process.env.ECS_PK,
        });
    }
});

/**
 * 보조 서비스를 시작함
 * @param target
 */
const startSubtask = (target: `/${string}`) => {
    const { ECS_ID, ECS_REVISION } = process.env;
    // node file.js ${ECS_ID}
    const child = fork(__dirname + target, [`${ECS_ID}`, `${ECS_REVISION}`]);
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
