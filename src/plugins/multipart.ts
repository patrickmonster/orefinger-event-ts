'use strict';

import fp from 'fastify-plugin';
import Multipart from '@fastify/multipart';

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
module.exports = fp(async function (fastify, opts) {
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
