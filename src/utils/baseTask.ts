import { scanEvent, selectEvent, selectEventBats } from 'controllers/bat';
import { ecsSelect } from 'controllers/log';
import EventEmitter from 'events';
import sleep from 'utils/sleep';

type TaskGetEvent = (noticeId: number, hashId: string) => Promise<any>;

interface TaskOptions {
    targetEvent: number;

    sleep?: number;
    timmer?: number; // 분단위
}

export class BaseTask extends EventEmitter {
    eventId: number = 0; // 이벤트 타입
    timmer = 0;

    // ECS Task
    taskRevision: string | undefined;
    taskId: number | undefined;

    taskState: boolean = false;

    taskEvent: TaskGetEvent | undefined;

    constructor({ targetEvent, timmer }: TaskOptions) {
        super();
        this.eventId = targetEvent;
        if (timmer) this.timmer = timmer;

        this.on('error', async () => {
            console.error('Error: ', this.eventId);
        });

        process.on('SIGINT', () => {
            console.log('');
            this.stop();
        });
    }

    /**
     * 멀티 테스크 전용 - ecs 클러스터 분활용
     * @param revision
     * @param taskId
     */
    changeTaskCount(revision: string, taskId: number) {
        this.taskRevision = revision;
        this.taskId = taskId;
    }

    start() {
        if (!this.taskState) {
            this.emit('log', `Start Task: ${this.eventId}`);
            this.taskState = true;
            this.task();
        }

        return this;
    }

    stop() {
        if (this.taskState) {
            this.taskState = false;
            this.emit('log', `Stop Task: ${this.eventId}`);
        }
        return this;
    }

    /**
     * 스캔 데이터
     *  - 테스크 가동전, 전체 데이터를 스캔하여, 현재 테스크에 필요한 데이터를 추출한다.
     *  - 추출된 데이터 기반으로 테스크를 가동한다.
     * @param idx - 현재 페이지
     */
    async task(idx: number = 0, length: number = 10) {
        if (!this.taskState) return;
        if (!this.taskRevision || this.taskId) {
            // Local Task
            const { totalPage, list } = await selectEventBats(this.eventId, {
                page: idx,
                limit: length,
            });

            for (const task of list) {
                try {
                    // console.log('SACAN', task);
                    this.emit('scan', task);
                    await sleep(1000); // Cull down the request
                } catch (e) {
                    this.emit('error', `Error: ${this.eventId}`, task.notice_id, task.hash_id);
                }
            }

            if (totalPage <= idx) {
                console.log(`탐색 :: ${this.eventId}`, new Date());
                idx = 0;
            } else idx++;
        } else {
            // ECS Task (full scan)
            const scan = await scanEvent(this.eventId); // 스캔 데이터
            const target = scan.find(item => item.target === '1'); // 활성 테스크
            this.emit('log', `Scan Event: ${this.eventId}`, scan, target);
            if (target) {
                const limit = Math.ceil(target.total / length); // 테스크당 데이터 처리에 필요한 개수
                const list = await selectEvent(this.eventId, limit, idx);
                for (const task of list) {
                    if (!this.taskState) return; // 테스크 중지
                    try {
                        this.emit('scan', task);
                        await sleep(1000); // Cull down the request (1초)
                    } catch (e) {
                        this.emit('error', `Error: ${this.eventId}`, task.notice_id, task.hash_id);
                    }
                }
            } else {
                // 활성 테스크 없음
            }
        }

        this.emit('log', `탐색 :: ${this.eventId} :: ${idx}`, new Date());
        await sleep(this.timmer); // next task
        if (this.taskRevision && this.taskId) {
            const ecs = await ecsSelect(this.taskRevision); // ECS Task
            const task = ecs.find(item => item.idx == this.taskId);
            this.task(task?.rownum || 0, ecs?.length || 1);
        } else this.task(idx);
    }
}
