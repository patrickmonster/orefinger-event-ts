import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { MultipartFile } from '@fastify/multipart';
import axios from 'axios';

import { v4 as uuidv4 } from 'uuid';

const s3 = new S3Client({
    region: 'ap-northeast-2',
    credentials: {
        accessKeyId: `${process.env.S3_ACCESS}`,
        secretAccessKey: `${process.env.S3_SECRET}`,
    },
});

export default s3;

/**
 * S3 업로드
 * @param auth_id
 * @param file
 * @param path
 * @returns
 */
export const upload = async (auth_id: string, file: MultipartFile, path: string) => {
    const uuid = uuidv4();
    const ext = file.filename.split('.').pop();
    const key = `${path}/${auth_id}/${uuid}.${ext}`;

    const buffer = await file.toBuffer();
    const command = new PutObjectCommand({
        Bucket: process.env.BUCKET || '',
        Key: key,
        Body: buffer,
        ContentType: file.mimetype,
    });

    await s3.send(command);
    return {
        key,
        type: file.mimetype,
        length: buffer.length,
        name: file.filename,
    };
};

/**
 * S3 업로드
 * @param auth_id
 * @param file
 * @param path
 * @returns
 */
export const uploadProfile = async (auth_id: string, avatar?: string) => {
    const uuid = uuidv4();
    const key = `profile/${auth_id}/${uuid}.png`;

    const fileName = avatar ? `${avatar}.png` : `${auth_id}.png`;

    const buffer = await axios
        .get(
            avatar
                ? `https://cdn.discordapp.com/avatars/${auth_id}/${fileName}`
                : `https://cdn.discordapp.com/embed/avatars/${fileName}`,
            { responseType: 'arraybuffer' }
        )
        .then(res => Buffer.from(res.data, 'binary'));

    const command = new PutObjectCommand({
        Bucket: process.env.BUCKET || '',
        Key: key,
        Body: buffer,
        ContentType: 'image/png',
    });

    await s3.send(command);

    return {
        key,
        type: 'image/png',
        length: buffer.length,
        name: fileName,
    };
};
