import { createClient } from 'redis';

const client = createClient({
    url: process.env.REDIS_URL,
    pingInterval: 1000 * 30,
});

console.log('REDIS_URL', process.env.REDIS_URL);

client.on('error', err => {});

client.on('reconnecting', () => {
    console.log('SUBSCRIBE] client reconnecting...');
});
client.on('connect', () => {
    console.log('SUBSCRIBE] client connected');
    client.set(`SERVER:START:${process.pid}`, new Date().toISOString(), {
        EX: 60 * 60,
    });
});

client.on('error', e => {
    console.log('SUBSCRIBE] Error', e);
});

process.on('SIGINT', function () {
    client.set(`SERVER:STOP:${process.pid}`, new Date().toISOString(), {
        EX: 60 * 60,
    });
    client.disconnect();
});

// 타임아웃 발생 방지
setTimeout(() => {
    client.connect().catch(e => console.error(e));
}, 1000 * 5);

export default client;

export type QueryKey = string | number;
