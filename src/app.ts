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

import { close } from 'components/socket/socketServer';
import 'utils/procesTuning';
import { addServerRequest } from 'utils/serverState';

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
    console.log(`Server started in  ${process.uptime()}s`);
    console.log(`Server listening at ${address}`);
});

server.addHook('onClose', async () => {
    close();
});

//////////////////////////////////////////////////////////////////////
// 프로세서 모듈
