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
import { ParseInt } from 'utils/object';
import 'utils/procesTuning';
import { addServerRequest } from 'utils/serverState';

const server = fastify({
    // logger: env.NODE_ENV != 'prod'
    logger: { transport: { target: '@fastify/one-line-logger' } },
    ajv: { plugins: [ajvFilePlugin] },
});

// 플러그인
server.register(helmet, { global: true });
server.register(Multipart);

// const sshTunnel = new SshTunnel({
//     host: env.TARGET_HOST || 'localhost',
//     port: 22,
//     username: env.TARGET_NAME,
//     privateKey: readFileSync(join(env.PWD || __dirname, 'db.pem')),
// });

// console.log(readFileSync(join(env.PWD || __dirname, 'db.pem')));

/* 데이터 베이스 터널링을 만듬 */
// const host = `${env.DB_HOST || 'localhost'}`;
// const port = `${env.DB_PORT || '3306'}`;
// env.DB_HOST = '127.0.0.1';
// env.DB_PORT = (3400 + Math.floor(Math.random() * 501)).toString();

// sshTunnel.forwardOut(`${env.DB_PORT}:${host}:${port}`).then(config => {
// console.log('CONNECTED ::', config.id, env.DB_PORT);

server.register(AutoLoad, { dir: join(__dirname, 'plugins') });
// 라우터
server.register(AutoLoad, { dir: join(__dirname, 'routes'), ignorePattern: /.*(test|spec|interface).*/ });

server.listen({ port: ParseInt(process.env.PORT || 3000), host: '::' }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server started in  ${process.uptime()}s`);
    console.log(`Server listening at ${address}`);
});

// });

// process.on('SIGINT', sshTunnel.close);

// 서버 요청 카운트
server.addHook('onRequest', (request, reply, done) => {
    addServerRequest();
    done();
});

//////////////////////////////////////////////////////////////////////
// 프로세서 모듈
