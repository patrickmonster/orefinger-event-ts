import { format } from 'date-fns';
import redis from './redis';

const getDate = () => ({
    date: format(new Date(), 'yyyy:MM:dd:HH:mm'),
    EX: 60 * 60,
});

const saveRedis = (tag: string, data: any) => {
    const { date, EX } = getDate();
    const key = `${tag}:${date}`;
    redis.set(key, JSON.stringify(data), {
        EX,
    });
    return key;
};

export const error = (tag: string, err: any) => saveRedis(`${tag}:ERROR`, err);
export const log = (tag: string, data: any) => saveRedis(`${tag}:LOG`, data);
export const info = (tag: string, data: any) => saveRedis(`${tag}:INFO`, data);
