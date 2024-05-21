import { ECSState, ECSStateMessage, LiveState, LiveStateMessage } from 'interfaces/redis';
import Redis from 'ioredis';

// const client = createClient({
//     url: process.env.REDIS_URL,
//     pingInterval: 1000 * 30,
//     // legacyMode: true, // 레거시 모드
// });

const client = new Redis(`${process.env.REDIS_URL}`, {
    enableAutoPipelining: true,
});

console.log('REDIS_URL', process.env.REDIS_URL);

client.on('error', err => {});

client.on('reconnecting', () => {
    console.log('REDIS] client reconnecting...');
});
client.on('connect', () => {
    console.log('REDIS] client connected');
    client.set(`SERVER:START:${process.pid}`, new Date().toISOString(), 'EX', 60 * 60);
});

client.on('error', e => {
    console.log('REDIS] Error', e);
});

process.on('SIGINT', function () {
    client.set(`SERVER:STOP:${process.pid}`, new Date().toISOString(), 'EX', 60 * 60);
    client.disconnect();
});

export default client;

const cacheKey = (key: string) => `cache:${key}`;

export const saveRedis = (key: string, value: any, expire = 60 * 60 * 1) => {
    return client.set(key, JSON.stringify(value), 'EX', expire);
};

export const cacheRedis = (key: string, value: any, expire = 60 * 60 * 1) => {
    return client.set(cacheKey(key), JSON.stringify(value), 'EX', expire);
};

export const loadRedis = async <T>(key: string) => {
    const data = await client.get(cacheKey(key));
    if (!data) return null;

    return JSON.parse(data) as T;
};

export const catchRedis = async <T>(key: string, callback: () => Promise<T>, expire = 60 * 60 * 1) => {
    const data = await client.get(key);

    if (data) return JSON.parse(data) as T;

    const result = await callback();

    await saveRedis(key, result, expire);
    console.log('REDIS] catchRedis', key, result);

    return result;
};

////////////////////////////////////////////////////////////////////////////////////////

const publish = async (channel: string, message: string) => {
    client.publish(channel, message).catch(console.error);
};

export const LiveStatePublish = async (state: LiveState, message: LiveStateMessage) => {
    publish(
        REDIS_KEY.SUBSCRIBE.LIVE_STATE(state),
        JSON.stringify({
            ...message,
            id: process.env.ECS_PK,
        })
    );
};

export const ECSStatePublish = async (state: ECSState, message: ECSStateMessage) => {
    publish(
        REDIS_KEY.SUBSCRIBE.ECS_CHAT_STATE(state),
        JSON.stringify({
            ...message,
            revision: process.env.ECS_REVISION,
            id: process.env.ECS_PK,
        })
    );
};

export type QueryKey = string | number;

export const REDIS_KEY = {
    API: {
        SEARCH_USER: (id: string) => `api:search:user:${id}`,
        ATTACH_LIVE: (liveId: string | number, id: string) => `api:attach:live:${liveId}:${id}`,
        CHZZK_POST: (id: string) => `api:chzzk:post:${id}`,
        CHZZK_LIVE_STATE: (id: string) => `api:chzzk:live:state:${id}`,
        MAIN_TOTAL: 'api:main:total',
        MAIN_NOTICE: 'api:main:notice',
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
    CHAT: {
        CHZZK: (id: string) => `chat:chzzk:${id}`,
    },
    SUBSCRIBE: {
        LIVE_STATE: (state: LiveState) => `subscribe:live:${state}`,
        ECS_CHAT_STATE: (state: ECSState) => `subscribe:ecs:chat:${state}`,
    },
};
