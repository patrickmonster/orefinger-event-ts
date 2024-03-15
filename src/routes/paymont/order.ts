'use strict';
import { billing } from 'components/billing';
import { selectPayments } from 'controllers/paymont';
import { FastifyInstance } from 'fastify';
import { ENCRYPT_KEY, decrypt, sha256 } from 'utils/cryptoPw';

export default async (fastify: FastifyInstance, opts: any) => {
    fastify.get(
        '',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
                description: '등록된 카드 리스트 조회',
                summary: '카드 리스트',
                tags: ['Paymont'],
                deprecated: false,
                response: {
                    200: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                type: { type: 'number' },
                                user_id: { type: 'string' },
                                auth_id: { type: 'string' },
                                login: { type: 'string' },
                                name: { type: 'string' },
                                user_type: { type: 'number' },
                                avatar: { type: 'string' },
                                is_session: { type: 'string', enum: ['Y', 'N'] },
                                create_at: { type: 'string' },
                                update_at: { type: 'string' },
                            },
                        },
                    },
                },
            },
        },
        async request =>
            selectPayments(request.user.id).then(payments =>
                payments.map(payment => {
                    return {
                        ...payment,
                        user_id: decrypt(payment.email, ENCRYPT_KEY, payment.login),
                        email: '-',
                        login: payment.user_id,
                    };
                })
            )
    );

    fastify.post<{
        Body: {
            card_number: string;
            amount: number;
            orderName: string;
        };
    }>(
        '/pay',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
                description: '카드 결제 요청',
                summary: '결제 요청',
                tags: ['Paymont'],
                deprecated: false,
                body: {
                    type: 'object',
                    properties: {
                        card_number: { type: 'string' },
                        amount: { type: 'number', description: '결제 금액' },
                        orderName: { type: 'string', description: '주문명' },
                    },
                },
            },
        },
        async request => {
            const { card_number, amount, orderName } = request.body;

            if (amount < 100) {
                return fastify.httpErrors.badRequest('결제 금액은 100원 이상이어야 합니다.');
            }

            const userId = sha256(card_number, ENCRYPT_KEY);
            const [item] = await selectPayments(request.user.id, userId);

            if (!item) {
                return fastify.httpErrors.notFound('등록된 카드가 없습니다.');
            }

            return await billing(amount, orderName, item);
        }
    );
};
