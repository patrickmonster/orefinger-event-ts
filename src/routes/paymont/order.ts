'use strict';
import { billing } from 'components/billing';
import { selectPayments } from 'controllers/paymont';
import { FastifyInstance } from 'fastify';
import { ENCRYPT_KEY, sha256 } from 'utils/cryptoPw';

export default async (fastify: FastifyInstance, opts: any) => {
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
