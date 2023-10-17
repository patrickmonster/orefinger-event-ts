'use strict';

import Multipart from '@fastify/multipart';
import fp from 'fastify-plugin';

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp(async function (fastify, opts) {
    fastify.addSchema({
        $id: 'fileUpload',
        type: 'object',
        properties: {
            name: { type: 'string', description: '파일등록시, 구분하기 위한 코드' },
            file: { type: 'string', format: 'binary' },
        },
    });

    fastify.register(Multipart, {
        attachFieldsToBody: true,
        limits: {
            fileSize: 10_000_000,
            fieldSize: 1_000,
            files: 10,
        },
    });
});
