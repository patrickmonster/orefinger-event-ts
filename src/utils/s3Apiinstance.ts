import { MultipartFile } from '@fastify/multipart';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
        Bucket: 'orefinger.media',
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
