import { createClient } from 'redis';

const client = createClient({
    url: process.env.REDIS_URL,
    pingInterval: 1000 * 30,

    // url: 'redis://localhost:6379',
});

client.on('error', err => {});

client.on('reconnecting', () => {
    console.log('REDIS] client reconnecting...');
});
client.on('connect', () => {
    console.log('REDIS] client connected');
    client.set(`SERVER:START:${process.pid}`, new Date().toISOString(), {
        EX: 60 * 60,
    });
});

process.on('SIGINT', function () {
    client.set(`SERVER:STOP:${process.pid}`, new Date().toISOString(), {
        EX: 60 * 60,
    });
    client.disconnect();
});

client.connect().catch(e => console.error(e));

export default client;
