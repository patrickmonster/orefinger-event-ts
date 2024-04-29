import { FastifyInstance } from 'fastify';
import WebSocket from 'ws';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.get<{
        Params: { token: string };
    }>('/chzzk/ws/:token', { websocket: true }, async (socket, req) => {
        fastify.jwt.verify(req.params.token, (err, decoded) => {
            if (err) {
                socket.send(JSON.stringify({ error: 'invalid token' });
                socket.close();
            }
            socket.on('message', message => {
                onMessage(socket, message.toString());
            });
        });
    });

    const onMessage = (socket : WebSocket.WebSocket, message : string) => {
        console.log('received message:', message);
        // socket.send(JSON.stringify({ echo: message }));
    }
};
