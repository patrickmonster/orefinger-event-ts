import { Content as ChzzkContent } from 'interfaces/API/Chzzk';
import { ECStask } from 'interfaces/ecs';

export const bootTime = Date.now();

export let lastServerRequset = 0;

let serverRequset = 0;
export const addServerRequest = () => serverRequset++;

const timmer = setInterval(() => {
    lastServerRequset = serverRequset;
    serverRequset = 0;
}, 1000 * 60);

process.on('SIGINT', () => {
    timmer && clearInterval(timmer);
});

interface TaskOptions<T = any> {
    type: string;
    data: T;
}

process.on('message', (message: TaskOptions) => {
    const { type } = message;

    switch (type) {
        case 'ecsSet': {
            const data = message.data as ECStask & { insertId: number };
            console.log(`ECS SET ::`, data.insertId);

            break;
        }
        case 'liveCangeChzzk': {
            const liveStatus = message.data as ChzzkContent;
            console.log(`liveStatus ::`, liveStatus);

            const { status } = liveStatus;

            if (status === 'OPEN') {
            } else {
                console.log('end');
            }

            break;
        }
    }
});
