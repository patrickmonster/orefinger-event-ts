export const deleteObjectByKey = (obj: any, ...key: string[]) => {
    const out = Object.assign({}, obj);
    for (const k of key) {
        delete out[k];
    }
    return out;
};
