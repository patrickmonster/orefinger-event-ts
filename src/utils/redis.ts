import { createClient } from 'redis';

const client = createClient({
    url: process.env.REDIS_URL,
    pingInterval: 1000 * 30,
    // legacyMode: true, // 레거시 모드
});

console.log('REDIS_URL', process.env.REDIS_URL);

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

client.on('error', e => {
    console.log('REDIS] Error', e);
});

process.on('SIGINT', function () {
    client.set(`SERVER:STOP:${process.pid}`, new Date().toISOString(), {
        EX: 60 * 60,
    });
    client.disconnect();
});

client.connect().catch(e => console.error(e));

export default client;

const instance = client.duplicate();
instance.connect().catch(e => console.error(e));

export const getInstance = () => {
    return instance;
};

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

    await client.set(key, JSON.stringify(result), {
        EX: expire,
    });

    console.log('REDIS] catchRedis', key, result);

    return result;
};

export type QueryKey = string | number;

export const REDIS_KEY = {
    API: {
        SEARCH_USER: (id: string) => `api:search:user:${id}`,
        ATTACH_LIVE: (liveId: string | number, id: string) => `api:attach:live:${liveId}:${id}`,
        CHZZK_POST: (id: string) => `api:chzzk:post:${id}`,
        MAIN_TOTAL: 'api:main:total',
    },
    DISCORD: {
        GUILD_CHANNELS: (id: string) => `discord:channels:${id}`,
        CHANNELS: (id: string) => `discord:channel:${id}`,
        GUILD_EMOJIS: (id: string) => `discord:emojis:${id}`,
        GUILD_ROLES: (id: string) => `discord:roles:${id}`,
        USER: (id: string) => `discord:user:${id}`,
        GUILD: (id: string) => `discord:guild:me:${id}`,
        LAST_MESSAGE: (id: string) => `discord:last:message:${id}`,
        ANSWER_MESSAGE: (channlId: string, messageId: string) => `discord:answer:message:${channlId}:${messageId}`,
    },
    SQL: {
        SELECT: (queryKey: string | number) => `sql:select:${queryKey}`,
    },
};
