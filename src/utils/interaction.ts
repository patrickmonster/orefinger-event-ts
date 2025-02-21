import { IReply } from 'plugins/discord';
import nacl from 'tweetnacl';
/**
 * Flags that can be included in an Interaction Response.
 */
export enum InteractionResponseFlags {
    /**
     * Show the message only to the user that performed the interaction. Message
     * does not persist between sessions.
     */
    EPHEMERAL = 1 << 6,
}

/**
 * Converts different types to Uint8Array.
 *
 * @param value - Value to convert. Strings are parsed as hex.
 * @param format - Format of value. Valid options: 'hex'. Defaults to utf-8.
 * @returns Value in Uint8Array form.
 */
const valueToUint8Array = (value: Uint8Array | ArrayBuffer | Buffer | string, format?: string): Uint8Array => {
    if (value == null) {
        return new Uint8Array();
    }
    if (typeof value === 'string') {
        if (format === 'hex') {
            const matches = value.match(/.{1,2}/g);
            if (matches == null) {
                throw new Error('Value is not a valid hex string');
            }
            const hexVal = matches.map((byte: string) => parseInt(byte, 16));
            return new Uint8Array(hexVal);
        } else {
            return new TextEncoder().encode(value);
        }
    }
    try {
        if (Buffer.isBuffer(value)) {
            return new Uint8Array(value);
        }
    } catch (ex) {
        // Runtime doesn't have Buffer
    }
    if (value instanceof ArrayBuffer) {
        return new Uint8Array(value);
    }
    if (value instanceof Uint8Array) {
        return value;
    }
    throw new Error('Unrecognized value type, must be one of: string, Buffer, ArrayBuffer, Uint8Array');
};

/**
 * Merge two arrays.
 *
 * @param arr1 - First array
 * @param arr2 - Second array
 * @returns Concatenated arrays
 */
export const concatUint8Arrays = (arr1: Uint8Array, arr2: Uint8Array): Uint8Array => {
    const merged = new Uint8Array(arr1.length + arr2.length);
    merged.set(arr1);
    merged.set(arr2, arr1.length);
    return merged;
};

/**
 * Validates a payload from Discord against its signature and key.
 *
 * @param rawBody - The raw payload data
 * @param signature - The signature from the `X-Signature-Ed25519` header
 * @param timestamp - The timestamp from the `X-Signature-Timestamp` header
 * @param clientPublicKey - The public key from the Discord developer dashboard
 * @returns Whether or not validation was successful
 */
export const verifyKey = (
    rawBody: Uint8Array | ArrayBuffer | Buffer | string,
    signature: Uint8Array | ArrayBuffer | Buffer | string,
    timestamp: Uint8Array | ArrayBuffer | Buffer | string,
    clientPublicKey: Uint8Array | ArrayBuffer | Buffer | string
): boolean => {
    try {
        const timestampData = valueToUint8Array(timestamp);
        const bodyData = valueToUint8Array(rawBody);
        const message = concatUint8Arrays(timestampData, bodyData);

        const signatureData = valueToUint8Array(signature, 'hex');
        const publicKeyData = valueToUint8Array(clientPublicKey, 'hex');
        return nacl.sign.detached.verify(message, valueToUint8Array(signature, 'hex'), publicKeyData);
    } catch (ex) {
        console.error('[discord-interactions]: Invalid verifyKey parameters', ex);
        return false;
    }
};

///////////////////////////////////////////////////////////////////////////////////////////////
// 인터렉션 명령 탐색
type EXEC<E extends IReply, F extends any> = (interaction: E, ...args: F[]) => Promise<void>;
type ComponentReturnType<E extends IReply, F> = [string, EXEC<E, F>];

export const getCommand = <E extends IReply, F>(
    list: {
        name: string;
        pathTag: string;
        path: string[];
        file: string;
    }[]
) =>
    list
        .reduce<ComponentReturnType<E, F>[]>((prev, { name: fileName, file, path, pathTag }) => {
            try {
                if (file.endsWith('.map')) return prev;
                const command: {
                    name: string;
                    default: { alias: string[] | string };
                    exec: EXEC<E, F>;
                } = require(file);

                prev.push([command.name || fileName, command.exec]);

                const aliasList = command?.default?.alias
                    ? Array.isArray(command.default.alias)
                        ? command.default.alias
                        : [command.default.alias]
                    : [];
                for (const alias of aliasList) prev.push([[alias].join(pathTag), command.exec]);
            } catch (e) {
                console.error(e);
            }

            return prev;
        }, [])
        .sort(([a], [b]) => b.length - a.length); // 정렬 (긴것부터 찾도록)
