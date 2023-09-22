import { MultipartFile } from '@fastify/multipart';
import { getCommantList, getPostDil, getPostList } from 'controllers/post';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

import path from 'path';
import { upload } from 'utils/s3Apiinstance';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.post<{
        Querystring: { name: string };
        Body: { file: MultipartFile };
    }>(
        '',
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
            },
            validatorCompiler: () => () => true,
        },
        async req => {
            const { name } = req.query;
            const { file } = req.body;
            const { id } = req.user;

            console.log('file', file);
            console.log('name', name);

            // const buffer =await upload(id, file, 'upload');

            return name;
        }
    );
};
