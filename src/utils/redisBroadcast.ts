import { createClient } from 'redis';

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

// 타임아웃 발생 방지
setTimeout(() => {
    client.connect().catch(e => console.error(e));
}, 1000 * 5);

export default client;
