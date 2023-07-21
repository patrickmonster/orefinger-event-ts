import fastify from 'fastify';
import AutoLoad from '@fastify/autoload';
import helmet from '@fastify/helmet';

import path, { join } from 'path';
import { env } from 'process';
import { existsSync } from 'fs';
import { config } from 'dotenv';

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

const server = fastify({ logger: env.NODE_ENV != 'prod' });

server.register(helmet, { global: true });

server.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
});

server.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
});
server.listen({ port: 3000, host: '::' }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
    // ping().catch(e => console.error(e));
});
