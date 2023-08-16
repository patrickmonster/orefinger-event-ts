'use strict';
import fp from 'fastify-plugin';

import anySchema from '@fastify/any-schema';

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp(async function (fastify, opts) {
    fastify.register(anySchema, {
        schemas: [
            {
                $id: 'schema1',
                type: 'object',
                properties: {
                    hello: { type: 'string' },
                },
            },
            {
                $id: 'schema2',
                type: 'object',
                properties: {
                    winter: { type: 'string' },
                },
            },
        ],
    });

    fastify.get<{
        Params: { schema: 'schema1' | 'schema2' };
    }>('/:schema', (req, reply) => {
        reply.schema(req.params.schema).send({ hello: 'world' });
    });
});
