import { saveRedis } from './redis';

export const error = (tag: string, err: any) => {
    const date = `ERROR:${tag}:${Date.now()}`;
    saveRedis(date, err, 60 * 60 * 24 * 7);
    return date;
};
