import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import redis from 'utils/redis';
import crypto from 'crypto';

export default async (fastify: FastifyInstance, opts: any) => {
    const SECRET = `${process.env.TWITCH_EVENTSUB_SECRET || '12345678901234567890'}`;

    const event = async (req: FastifyRequest, res: FastifyReply) => {
        let { body, headers } = req;

        if (Buffer.isBuffer(body)) {
            body = JSON.parse(body.toString());
        } else if (typeof body === 'string') {
            body = JSON.parse(decodeURIComponent(body));
        }

        if (headers.hasOwnProperty('twitch-eventsub-message-signature')) {
            const id = `${headers['twitch-eventsub-message-id']}`;
            const timestamp = `${headers['twitch-eventsub-message-timestamp']}`;
            const [hash, secret_value] = `${headers['twitch-eventsub-message-signature']}`.split('=');

            const buf = Buffer.from(JSON.stringify(body));
            const calculated_signature = crypto
                .createHmac(hash, SECRET)
                .update(id + timestamp + buf)
                .digest('hex');

            // 승인된 요청
            if (calculated_signature == secret_value) {
                if (headers['twitch-eventsub-message-type'] == 'webhook_callback_verification') {
                    // process.emit('register', body);
                    // console.log('notification created]', JSON.stringify({ type: body.subscription.type, event: body.event }));
                    return res.code(200).send(encodeURIComponent((<{ challenge: string }>body).challenge));
                }
                res.code(200).send('OK');

                const msg_id = headers['twitch-eventsub-message-id'];
                const msg_type = headers['twitch-eventsub-message-type'];

                try {
                    const message = await redis.get(`event:${msg_id}`);
                    if (message) return;
                } catch (e) {}

                // 6시간 동안 메시지를 저장
                try {
                    await redis.set(`event:${msg_id}`, JSON.stringify((<{ event: string }>body).event), {
                        EX: 60 * 60 * 6,
                    });
                } catch (e) {}

                switch (msg_type) {
                    case 'notification':
                        // console.log('notification received]', JSON.stringify({ type: body.subscription.type, event: body.event }));
                        // process.emit('event', body);
                        // process.emit(body.subscription.type, { event: body.event, subscription: body.subscription });
                        break;
                    // case 'webhook_callback_verification':
                    //     break;
                    case 'revocation':
                        // console.log('notification revoked]', JSON.stringify({ type: body.subscription.type, id: body.subscription.id }));
                        // process.emit('revocation', body);
                        // getToken();
                        break;
                    default:
                        break;
                }
                return;
            }
        }
        res.code(401).send('Unauthorized request to EventSub webhook');
    };

    fastify.post('/twitch/eventsub', { schema: { hide: true } }, event);
};
