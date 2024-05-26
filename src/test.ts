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

import { getLiveMessage as chzzk } from 'components/user/chzzk';
import { NoticeBat } from 'interfaces/notice';
import { BaseTask } from 'utils/baseTask';

const task = new BaseTask({ targetEvent: 4, timmer: 100, loopTime: 500 }).on('scan', async (item: NoticeBat) => {
    try {
        const liveStatus = await chzzk(item);

        if (liveStatus) {
            process.send?.({
                type: 'liveCangeChzzk',
                data: {
                    liveStatus,
                },
            });
        }
    } catch (e: any) {
        if (e) {
            // 서비스 차단
            console.error('서비스 차단', e);
        }
    }
});
