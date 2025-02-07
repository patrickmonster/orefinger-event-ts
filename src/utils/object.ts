export const deleteObjectByKey = (obj: any, ...key: string[]) => {
    const out = Object.assign({}, obj);
    for (const k of key) {
        delete out[k];
    }
    return out;
};

export const isNumeric = (data: string): boolean => !isNaN(Number(data));

const getServiceId = (channelId: string, maxSize = 9) =>
    (Math.abs(channelId.split('').reduce((acc, cur) => acc + cur.charCodeAt(0), 0)) % maxSize) + 1;

export const getMessageId = (time: number, userId: string) => {
    let snowflake = BigInt(time - 1_420_070_400_000) & ((BigInt(1) << BigInt(41)) - BigInt(1)); // 41 bits for timestamp
    snowflake = snowflake << BigInt(22); // shift 22 bits
    snowflake |= BigInt(getServiceId(userId, 1023) & ((1 << 10) - 1)) << BigInt(12); // 10 bits for node id
    snowflake |= BigInt(process.pid & ((1 << 12) - 1)); // 12 bits for counter

    return snowflake.toString();
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

export const getTimeStringSeconds = (seconds: number) => {
    const hour = Math.floor(seconds / 3600);

    const min = Math.floor((seconds % 3600) / 60);
    const sec = Math.floor(seconds % 60);

    return `${hour === 0 ? '' : `${hour}시간 `}${min === 0 && hour === 0 ? '' : `${min}분 `}${sec}초`;
};

export const appendUrlHttp = (url: string) => {
    if (url.startsWith('https')) return url;
    if (url.startsWith('//')) return `https:${url}`;
    if (url.startsWith('www.')) return `https://${url}`;
    return `https://${url}`;
};

export const randomIntegerInRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
export const bigintConvert = (key: string, value: any) => (typeof value === 'bigint' ? value.toString() : value);
export const ParseInt = (id: string | number) => (typeof id == 'string' ? parseInt(id) : id);

export const LoopRunQueue = <T>(func: (l: T[]) => Promise<any>, time?: number, limit = 100) => {
    const list: T[] = [];

    const loop = async () => {
        list.length && (await func(list));
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

export const getContentAllias = (conent: any, ...alias: string[]) => {
    for (const a of alias) {
        if (conent[a]) {
            return conent[a];
        }
    }
    return null;
};

/**
 * 인증번호를 생성합니다.
 * @param length
 * @returns
 */
export const authRandNum = (length: number = 5) =>
    Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
