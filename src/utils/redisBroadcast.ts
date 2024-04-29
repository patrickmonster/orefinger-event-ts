import { ECSState, ECSStateMessage, LiveState, LiveStateMessage } from 'interfaces/redis';
import { createClient } from 'redis';
import { REDIS_KEY } from './redis';

/**
 * Redis BroadCast
 *  이벤트 수신 서버
 *  - ECSStateSubscribe
 *  - LiveStateSubscribe
 *
 * @version 1.0
 */
const client = createClient({
    url: process.env.REDIS_URL,
    pingInterval: 1000 * 30,
});

console.log('SUBSCRIBE_URL', process.env.REDIS_URL);

client
    .on('error', err => {})
    .on('reconnecting', () => {
        console.log('SUBSCRIBE] client reconnecting...');
    })
    .on('connect', () => {
        console.log('SUBSCRIBE] client connected');
    })
    .on('error', e => {
        console.log('SUBSCRIBE] Error', e);
    });

process.on('SIGINT', function () {
    client.quit();
});

////////////////////////////////////////////////////////////////////////////////////////

interface BaseState {
    revision: string;
    id: string;
}

export const ECSStateSubscribe = async (state: ECSState, onMessage: (message: ECSStateMessage & BaseState) => void) => {
    client
        .subscribe(REDIS_KEY.SUBSCRIBE.ECS_CHAT_STATE(state), (message: string) => {
            const { id } = JSON.parse(message) as BaseState;
            if (id === process.env.ECS_PK) return;
            onMessage(JSON.parse(message));
        })
        .catch(console.error);
};
export const LiveStateSubscribe = async (
    state: LiveState,
    onMessage: (message: LiveStateMessage & BaseState) => void
) => {
    client
        .subscribe(REDIS_KEY.SUBSCRIBE.LIVE_STATE(state), (message: string) => {
            onMessage(JSON.parse(message));
        })
        .catch(console.error);
};

// 타임아웃 발생 방지
setTimeout(() => {
    client.connect().catch(e => console.error(e));
}, 1000 * 5);

export default client;
