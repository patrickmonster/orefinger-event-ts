import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import redis from 'utils/redis';

import { EventSub } from 'interfaces/eventsub';

import { register } from 'controllers/twitch';

export default async (fastify: FastifyInstance, opts: any) => {
    const event = (
        req: FastifyRequest<{
            Body: EventSub;
        }>,
        res: FastifyReply
    ) => {
        const { body, headers } = req;
        if (fastify.verifyTwitchEventSub(req, res)) {
            const msg_id = `${headers['twitch-eventsub-message-id']}`;
            const msg_type = `${headers['twitch-eventsub-message-type']}`;

            if (msg_type == 'webhook_callback_verification') {
                // 새로운 이벤트 등록
                register(body.subscription);
                return res.code(200).send(encodeURIComponent(`${body.challenge}`));
            }
            res.code(200).send('OK');

            let isExist = false;
            redis
                .get(`event:${msg_id}`)
                .then(message => {
                    isExist = !!message;
                })
                .catch(e => {}) // ignore
                .finally(() => {
                    if (isExist) return;
                    redis
                        .set(`event:${msg_id}`, JSON.stringify(body.event), {
                            EX: 60 * 60 * 6,
                        })
                        .catch(e => {});

                    switch (msg_type) {
                        case 'notification':
                            console.log('notification received]', JSON.stringify({ type: body.subscription.type, event: body.event }));
                            // process.emit('event', body);
                            // process.emit(body.subscription.type, { event: body.event, subscription: body.subscription });
                            break;
                        case 'revocation':
                            console.log('notification revoked]', JSON.stringify({ type: body.subscription.type, id: body.subscription.id }));
                            break;
                        default:
                            break;
                    }
                });
        }
    };

    fastify.post('/twitch/event', { schema: { hide: true } }, event);
    fastify.post('/event/twitch', { schema: { hide: true } }, event);
};
