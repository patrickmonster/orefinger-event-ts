import { MultipartFile } from '@fastify/multipart';
import { FastifyInstance } from 'fastify';

import { deleteFile, insertFile, selectFile, selectFileType } from 'controllers/CDN/file';
import { Paging } from 'interfaces/swagger';
import { upload } from 'utils/s3Apiinstance';

export default async (fastify: FastifyInstance, opts: any) => {
    const types = await selectFileType();

    fastify.addSchema({
        $id: 'uploadTaget',
        type: 'object',
        required: ['target'],
        properties: {
            name: { type: 'string' },
            label_id: { type: 'number' },
            label_lang: { type: 'number' },
            type_idx: { type: 'number' },
            text_id: { type: 'number' },
            emoji: { type: 'string' },
            custom_id: { type: 'string' },
            value: { type: 'string' },
            style: { type: 'number' },
            min_values: { type: 'number' },
            max_values: { type: 'number' },
            permission_type: { type: 'number' },
            create_at: { type: 'string' },
            update_at: { type: 'string' },
            order_by: { type: 'number' },
        },
    });

    fastify.get<{
        Querystring: Paging & { target: string };
    }>(
        '',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
                tags: ['File'],
                summary: '파일 목록',
                description: '파일 목록',
                querystring: {
                    allOf: [
                        { $ref: 'paging#' },
                        {
                            type: 'object',
                            properties: {
                                target: {
                                    type: 'string',
                                    description: '파일 업로드 타겟',
                                    enum: types.map(({ name }) => name),
                                },
                            },
                        },
                    ],
                },
            },
        },
        async req =>
            await selectFile(
                req.query,
                req.user.id,
                req.query.target ? types.find(({ name }) => name === req.query.target)?.idx : undefined
            )
    );

    fastify.delete<{
        Params: { key: string };
    }>(
        '/:key',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
                tags: ['File'],
                summary: '파일 삭제',
                description: '파일 삭제',
                params: {
                    type: 'object',
                    required: ['key'],
                    properties: {
                        key: { type: 'string', description: '파일 키' },
                    },
                },
            },
        },
        async req => {
            const { key } = req.params;
            const { id } = req.user;

            try {
                await deleteFile(id, key);

                return {
                    status: 200,
                    message: '파일 삭제 성공',
                };
            } catch (e) {}
            return fastify.httpErrors.internalServerError('파일 삭제 실패');
        }
    );

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
                tags: ['File'],
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
                            enum: types.map(({ name }) => name),
                        },
                    },
                },
            },
            validatorCompiler: () => () => true,
        },
        async req => {
            const { name } = req.query; // 파일 이름
            const { file } = req.body;
            const { target } = req.params; // 경로
            const { id } = req.user; // 사용자 id

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
