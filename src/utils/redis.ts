import { createClient, RedisDefaultModules } from 'redis';

const client = createClient({
    url: process.env.REDIS_URL,
});

client.connect().then(() => {
    console.log('REDIS] client connected');
    setInterval(() => client.ping(), 1000 * 30); // 통신 채널 확보
});

export default client;
