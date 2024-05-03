import redis from './redis';

export const error = (tag: string, err: any) => {
    const date = `ERROR:${tag}:${Date.now()}`;
    redis.set(date, JSON.stringify(err), 'EX', 60 * 60 * 24 * 7);
    return date;
};
