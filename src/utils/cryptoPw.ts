import { MultipartFile } from '@fastify/multipart';
import crypto from 'crypto';

export const ENCRYPT_KEY = process.env.JWT_SECRET || Array(32).fill('1').join('');

export const sha256 = (passwd: string, key: string) =>
    crypto.createHmac('sha256', key).update(passwd).digest('base64').replace(/=/gi, '');

export const getFileHash = async (file: MultipartFile): Promise<string> => {
    const hash = crypto.createHash('sha256');
    for await (const chunk of file.file) {
        hash.update(chunk);
    }
    return hash.digest('hex');
};
