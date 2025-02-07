import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES, this is always 16

export const ENCRYPT_KEY = process.env.JWT_SECRET || Array(32).fill('1').join('');

export const sha256 = (passwd: string, key: string) =>
    crypto.createHmac('sha256', key).update(passwd).digest('base64').replace(/=/gi, '');

export const encrypt = (passwd: string, key: string) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv); // des알고리즘과 키를 설정

    const encrypted = cipher.update(passwd, 'utf8', 'base64') + cipher.final('base64');
    return {
        iv: iv.toString('base64'),
        content: encrypted,
    };
};

export const encryptByIv = (passwd: string, key: string, ivString: string) => {
    const iv = Buffer.from(ivString.substring(0, IV_LENGTH), 'utf8');
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv); // des알고리즘과 키를 설정

    const encrypted = cipher.update(passwd, 'utf8', 'base64') + cipher.final('base64');
    return encrypted;
};

export const decrypt = (content: string, key: string, iv: string) => {
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'base64'));
    return decipher.update(content, 'base64', 'utf8') + decipher.final('utf8');
};

export const decryptByIv = (content: string, key: string, ivString: string) => {
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivString.substring(0, IV_LENGTH), 'utf8'));
    return decipher.update(content, 'base64', 'utf8') + decipher.final('utf8');
};
