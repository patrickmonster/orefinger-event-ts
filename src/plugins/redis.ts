'use strict';
import fp from 'fastify-plugin';
import crypto from 'crypto';
import { FastifyRequest } from 'fastify';

import redis from 'utils/redis';

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp(async function (fastify, opts) {
    fastify.decorate('redis', redis);
});
