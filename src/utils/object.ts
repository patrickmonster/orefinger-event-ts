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
