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

export const catchRedis = async <T>(key: string, callback: () => Promise<T>, expire = 60 * 60 * 1) => {
    const data = await client.get(key);
    if (data) return JSON.parse(data) as T;

    const result = await callback();
    client.set(key, JSON.stringify(result), {
        EX: expire,
    });
    return result;
};

export type QueryKey = string | number;

export const REDIS_KEY = {
    API: {
        SEARCH_USER: (id: string) => `api:search:user:${id}`,
        ATTACH_LIVE: (liveId: string | number, id: string) => `api:attach:live:${liveId}:${id}`,
    },
    DISCORD: {
        GUILD_CHANNELS: (id: string) => `discord:channel:${id}`,
        GUILD_EMOJIS: (id: string) => `discord:emojis:${id}`,
        GUILD_ROLES: (id: string) => `discord:roles:${id}`,
        USER: (id: string) => `discord:user:${id}`,
    },
    SQL: {
        SELECT: (queryKey: string | number) => `sql:select:${queryKey}`,
    },
};
