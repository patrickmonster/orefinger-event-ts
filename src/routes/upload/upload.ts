import { MultipartFile } from '@fastify/multipart';
import { FastifyInstance } from 'fastify';

import { insertFile } from 'controllers/CDN/file';
import { upload } from 'utils/s3Apiinstance';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.post<{
        Querystring: { name: string };
        Body: { file: MultipartFile };
        Params: { target: string };
    }>(
        '/:target',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
                tags: ['파일'],
                summary: '파일 업로드',
                description: '파일 업로드',
                consumes: ['multipart/form-data'],
                body: {
                    type: 'object',
                    required: ['file'],
                    properties: {
                        file: { type: 'string', format: 'binary', description: '파일' },
                    },
                },
                querystring: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: { type: 'string', description: '파일 이름' },
                    },
                },
                params: {
                    type: 'object',
                    required: ['target'],
                    properties: {
                        target: {
                            type: 'string',
                            description: '파일 업로드 타겟',
                            enum: ['upload', 'profile', 'post', 'comment'],
                        },
                    },
                },
            },
            validatorCompiler: () => () => true,
        },
        async req => {
            const { name } = req.query;
            const { file } = req.body;
            const { target } = req.params;
            const { id } = req.user;

            try {
                const { key, type, length } = await upload(id, file, target);

                await insertFile({
                    name,
                    auth_id: id,
                    src: key,
                    content_type: type,
                    size: length,
                });

                return {
                    status: 200,
                    message: '파일 업로드 성공',
                    data: {
                        key,
                        type,
                        length,
                    },
                };
            } catch (e) {
                return {
                    status: 500,
                    message: '파일 업로드 실패',
                };
            }
        }
    );
};
