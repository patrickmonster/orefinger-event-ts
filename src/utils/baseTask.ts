import { selectEventBats } from 'controllers/bat';
import EventEmitter from 'events';
import sleep from 'utils/sleep';

type TaskGetEvent = (noticeId: number, hashId: string) => Promise<any>;

interface TaskOptions {
    targetEvent: number;
    limit?: number;

    sleep?: number;
    timmer?: number; // 분단위
}

export class BaseTask extends EventEmitter {
    eventId: number = 0;
    limit = 10;
    timmer = 10;

    taskCount = 0;
    taskIndex = 0;

    interval: NodeJS.Timeout | undefined;

    taskEvent: TaskGetEvent | undefined;

    constructor({ targetEvent, limit, timmer }: TaskOptions) {
        super();
        this.eventId = targetEvent;
        if (limit) this.limit = limit;
        if (timmer) this.timmer = timmer;

        this.on('error', async () => {
            console.error('Error: ', this.eventId);
        });

        process.on('SIGINT', () => {
            console.log('');
            this.stop();
        });
    }

    changeTaskCount(taskCount: number, taskIndex: number) {
        this.taskCount = taskCount;
        this.taskIndex = taskIndex;
    }

    start() {
        if (!this.interval) {
            this.interval = setInterval(this.task.bind(this), 1000 * 60 * this.timmer || 10);
        }
        this.emit('log', `Start Task: ${this.eventId} (${this.limit})`);

        this.task();

        return this;
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
        this.emit('log', `Stop Task: ${this.eventId}`);

        return this;
    }

    /**
     * Scan Data
     *  - 테스크 가동전, 전체 데이터를 스캔하여, 현재 테스크에 필요한 데이터를 추출한다.
     *  - 추출된 데이터 기반으로 테스크를 가동한다.
     */
    scanData() {
        this.emit('log', `Scan Task: ${this.eventId}`);
    }

    async task() {
        const random = Math.floor(Math.random() * 10) + 5; // Random delay
        let pageIndex = 0;
        do {
            const { list, totalPage } = await selectEventBats(this.eventId, {
                page: pageIndex,
                limit: this.limit,
            });

            for (const task of list) {
                try {
                    // console.log('SACAN', task);
                    this.emit('scan', task);
                } catch (e) {
                    this.emit('log', `Start Task: ${this.eventId} (${this.limit})`);
                }
            }

            if (list.length === 0 || pageIndex > totalPage) break;
            pageIndex++;
            await sleep(1000 * random); // Cull down the request
        } while (true);

        console.log(`탐색 :: ${this.eventId}`, new Date(), pageIndex);
    }
}
