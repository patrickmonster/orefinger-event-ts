'use strict';
import { createCard } from 'components/billing';
import { selectPayments } from 'controllers/paymont';
import { FastifyInstance } from 'fastify';
import { Card } from 'interfaces/toss';
import { ENCRYPT_KEY, decrypt } from 'utils/cryptoPw';

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
                        // 카드 번호는 복호화 하여 전달
                        user_id: decrypt(payment.email, ENCRYPT_KEY, payment.login),
                        email: '-',
                        login: payment.user_id,
                    };
                })
            )
    );

    // 인증 모듈 - 토스
    fastify.post<{
        Querystring: {
            isTest: boolean;
        };
        Body: Card;
    }>(
        '/card',
        {
            onRequest: [fastify.authenticate],
            schema: {
                security: [{ Bearer: [] }],
                description: '계정 연결 - 디스코드 계정을 기반으로 토스 페이먼츠 카드 정보를 등록 합니다.',
                tags: ['Paymont'],
                deprecated: false, // 비활성화
                summary: '카드 신규 등록',
                querystring: {
                    type: 'object',
                    properties: {
                        isTest: {
                            type: 'boolean',
                            description: '테스트 결제 여부',
                            enum: [true, false],
                        },
                    },
                },
                body: {
                    type: 'object',
                    required: [
                        'cardNumber',
                        'cardExpirationYear',
                        'cardExpirationMonth',
                        'cardPassword',
                        'customerIdentityNumber',
                        'cardName',
                    ],
                    additionalProperties: false,
                    properties: {
                        cardNumber: { type: 'string', description: '카드번호' },
                        cardExpirationYear: { type: 'string', description: '카드 유효기간 연도' },
                        cardExpirationMonth: { type: 'string', description: '카드 유효기간 월' },
                        cardPassword: { type: 'string', description: '카드 비밀번호 앞 2자리' },
                        customerIdentityNumber: { type: 'string', description: '주민등록번호 또는 사업자등록번호' },
                        cardName: { type: 'string', description: '카드 별칭' },
                    },
                },
            },
        },
        async req => {
            const { isTest } = req.query;
            const { id } = req.user;
            const {
                cardNumber,
                cardExpirationYear,
                cardExpirationMonth,
                cardPassword,
                customerIdentityNumber,
                cardName,
            } = req.body;

            try {
                await createCard(
                    id,
                    {
                        cardNumber,
                        cardExpirationYear,
                        cardExpirationMonth,
                        cardPassword,
                        customerIdentityNumber,
                        cardName,
                    },
                    isTest
                );
                return { message: 'success' };
            } catch (e: any) {
                console.error(e);
                return { message: '인증에 실패함' };
            }
        }
    );
};
