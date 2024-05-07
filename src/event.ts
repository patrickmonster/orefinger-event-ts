import { createAdapter } from '@socket.io/redis-adapter';
import { Server } from 'socket.io';

import { ecsSelect } from 'controllers/log';

import Redis from 'ioredis';
import 'utils/procesTuning';

/**
 *
 * @description 알림 작업을 수행하는 스레드로써, 각 알림 스캔 작업을 수행합니다.
 */
const [, file, ECS_ID, ECS_REVISION] = process.argv;
if (ECS_ID) {
    ecsSelect(ECS_REVISION).then(tasks => {
        if (!tasks.length) return;
        const client = new Redis(`${process.env.REDIS_URL}`, {
            enableAutoPipelining: true,
        });
        const task = tasks.find(task => `${task.id}` === ECS_ID);
        process.env.ECS_ID = ECS_ID;
        process.env.ECS_REVISION = ECS_REVISION;
        process.env.ECS_FAMILY = `${task?.family}`;
        process.env.ECS_PK = `${task?.idx}`;
        process.env.ECS_ROWNUM = `${task?.rownum}`;

        const io = new Server({
            adapter: createAdapter(client.duplicate(), client.duplicate()),
        }).on('connection', socket => {
            console.log('connection', socket.id);
        });

        io.listen(5000);
    });
} else {
    console.log('ECS_ID is not defined');
}
