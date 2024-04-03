'use strict';
import fp from 'fastify-plugin';

import rateLimit from '@fastify/rate-limit';

const { version } = require('../../package.json');

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp(async function (fastify, opts) {
    fastify.register(rateLimit, {
        global: false,
    });
});
