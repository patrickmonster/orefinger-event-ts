import { FastifyInstance } from 'fastify';
import { subscriber } from 'utils/redis';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.get<{
        Querystring: { id: string };
    }>(
        '/:id',
        {
            websocket: true,
        },
        (connection, req) => {
            const { id } = req.query;
            connection.socket.on('message', (message: any) => {
                subscriber.publish('connect', message);
            });

            connection.socket.on('close', () => {
                console.log('closed');
            });

            process.on('SIGINT', () => {
                connection.socket.send('connection reset');
                connection.socket.close();
            });
        }
    );
};
