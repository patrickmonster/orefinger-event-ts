import KafkaConsumer from '@kafka-ts/fastify-consumer';
import fp from 'fastify-plugin';

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp(async function (fastify, opts) {
    fastify.register(KafkaConsumer, [
        {
            brokers: ['localhost:9092'],
            consumerOptions: {
                groupId: 'test-id',
            },
        },
        {
            clientId: 'test-client',
            brokers: ['localhost:9092'],
            consumerOptions: {
                groupId: 'test-id-2',
            },
        },
    ]);
});
