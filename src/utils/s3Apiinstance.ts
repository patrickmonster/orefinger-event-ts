import { MultipartFile } from '@fastify/multipart';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

import { v4 as uuidv4 } from 'uuid';

const s3 = new S3Client({
    region: 'ap-northeast-2',
    credentials: {
        accessKeyId: `${process.env.S3_ACCESS}`,
        secretAccessKey: `${process.env.S3_SECRET}`,
    },
});

export default s3;
export const upload = async (auth_id: string, file: MultipartFile, path: string) => {
    const uuid = uuidv4();
    const ext = file.filename.split('.').pop();
    const command = new PutObjectCommand({
        Bucket: 'orefinger.media',
        Key: `${path}/${auth_id}/${uuid}.${ext}`,
        Body: file.file,
        ContentType: file.mimetype,
    });

    // s3.upload()

    // return await s3.send(command);
};
