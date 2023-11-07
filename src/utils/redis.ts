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

const hashFuction = (key: string) => {
    let hash = 0;
    for (var i = 0; i < key.length; i++) {
        hash += key.charCodeAt(i);
    }
    return hash;
};

export type QueryKey = string | number;

export const REDIS_KEY = {
    DISCORD: {
        GUILD_CHANNELS: (id: string) => `discord:channel:${id}`,
    },
    SQL: {
        SELECT: (queryKey: string | number) => `sql:select:${queryKey}`,
    },
};
