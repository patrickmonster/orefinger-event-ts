export const deleteObjectByKey = (obj: any, ...key: string[]) => {
    const out = Object.assign({}, obj);
    for (const k of key) {
        delete out[k];
    }
    return out;
};

const regEx = /\{([0-9A-Za-z_]+)\}/i;
export const convertMessage = <T>(object: T, message: { [key: string]: string }) =>
    JSON.parse(
        JSON.stringify(object, (k: string, v: any) => {
            if (typeof v !== 'string') return v;
            if (v == 'Y') return true; // TODO: yn 인경우

            // 정규 변환식
            let tag;
            while ((tag = v.match(regEx)) !== null) {
                const [org, name] = tag;
                v = `${v.slice(0, tag.index)}${name in message ? message[name] : ''}${v.slice(tag.index + org.length)}`;
            }
            return v;
        })
    );

export const randomIntegerInRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const ParseInt = (id: string | number) => (typeof id == 'string' ? parseInt(id) : id);

export const LoopRunQueue = <T>(func: (l: T[]) => void, time?: number, limit = 100) => {
    const list: T[] = [];

    const loop = () => {
        list.length && func(list);
        list.length = 0;
        interval = setTimeout(loop, time || 1000 * 60);
    };

    let interval = setTimeout(loop, time || 1000 * 60);

    return (item: T) => {
        list.push(item);

        if (list.length >= limit) {
            clearTimeout(interval);
            loop();
        }
    };
};

export class RoundQueue<T> {
    private queue: T[] = [];
    private length = 0;
    private index = 0;

    private get nextIndex() {
        return this.index++ % this.size;
    }

    private get prevIndex() {
        return this.index-- % this.size;
    }

    public get size() {
        return this.length;
    }

    constructor(size: number) {
        this.queue = new Array(size);
        this.length = size;
    }

    public push(data: T) {
        this.queue[this.nextIndex] = data;
    }

    public pop() {
        return this.queue[this.prevIndex];
    }

    public get(index: number) {
        return this.queue[index];
    }

    public toArray() {
        return this.queue;
    }

    public clear() {
        this.queue = new Array(this.size);
    }

    public forEach(callback: (value: T, index: number, array: T[]) => void) {
        this.queue.forEach(callback);
    }

    public map<U>(callback: (value: T, index: number, array: T[]) => U) {
        return this.queue.map(callback);
    }

    public filter(callback: (value: T, index: number, array: T[]) => boolean) {
        return this.queue.filter(callback);
    }

    public find(callback: (value: T, index: number, array: T[]) => boolean) {
        return this.queue.find(callback);
    }

    public findIndex(callback: (value: T, index: number, array: T[]) => boolean) {
        return this.queue.findIndex(callback);
    }

    public some(callback: (value: T, index: number, array: T[]) => boolean) {
        return this.queue.some(callback);
    }

    public every(callback: (value: T, index: number, array: T[]) => boolean) {
        return this.queue.every(callback);
    }

    public reduce<U>(
        callback: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U,
        initialValue: U
    ) {
        return this.queue.reduce(callback, initialValue);
    }

    public reduceRight<U>(
        callback: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U,
        initialValue: U
    ) {
        return this.queue.reduceRight(callback, initialValue);
    }

    public includes(value: T, fromIndex?: number) {
        return this.queue.includes(value, fromIndex);
    }

    public indexOf(value: T, fromIndex?: number) {
        return this.queue.indexOf(value, fromIndex);
    }

    public lastIndexOf(value: T, fromIndex?: number) {
        return this.queue.lastIndexOf(value, fromIndex);
    }

    public join(separator?: string) {
        return this.queue.join(separator);
    }

    public toString() {
        return this.queue.toString();
    }

    public [Symbol.iterator]() {
        return this.queue[Symbol.iterator]();
    }

    public entries() {
        return this.queue.entries();
    }

    public keys() {
        return this.queue.keys();
    }

    public values() {
        return this.queue.values();
    }

    public copyWithin(target: number, start: number, end?: number) {
        return this.queue.copyWithin(target, start, end);
    }

    public fill(value: T, start?: number, end?: number) {
        return this.queue.fill(value, start, end);
    }

    public reverse() {
        return this.queue.reverse();
    }

    public sort(compareFn?: (a: T, b: T) => number) {
        return this.queue.sort(compareFn);
    }

    public slice(start?: number, end?: number) {
        return this.queue.slice(start, end);
    }
}
