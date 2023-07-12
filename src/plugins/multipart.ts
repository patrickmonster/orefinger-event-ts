'use strict';

import fp from 'fastify-plugin';
import Multipart from '@fastify/multipart';

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
module.exports = fp(async function (fastify, opts) {
    fastify.register(Multipart, {
        attachFieldsToBody: true,
        // sharedSchemaId: '#multipart',
        limits: {
            fileSize: 10_000_000,
            fieldSize: 1_000,
            files: 10,
        },
    });
});
