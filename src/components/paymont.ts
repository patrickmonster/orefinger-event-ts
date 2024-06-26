/*
카드 결제 모듈을 지정한 위치에 렌더링하는 컴포넌트
 -- 보안상의 이유로 카드 결제 모듈은 서버에서 렌더링되어야 함
*/

import { selectPayments } from 'controllers/paymont';
import { APIActionRowComponent, APIStringSelectComponent } from 'discord-api-types/v10';
import { IReply } from 'plugins/discord';
import { ENCRYPT_KEY, sha256 } from 'utils/cryptoPw';
import { createActionRow, createTextParagraphInput, createUrlButton } from 'utils/discord/component';
import { billing, createCard } from './billing';

type PaymentResult = APIActionRowComponent<APIStringSelectComponent>[];
export const authPaymentSelect = async (interaction: IReply) => {
    // 카드 리스트를 조회
};

export const createPaymentModel = (interaction: IReply) => {
    interaction.model({
        custom_id: 'payment create',
        title: '카드 결제 정보 입력 * 전송시 암호회됨 - 화면 노출 주의 *',
        components: [
            // 카드번호
            createTextParagraphInput('card_number', {
                label: '카드 번호',
                placeholder: '카드 번호를 입력해주세요',
                max_length: 20,
                min_length: 16,
                required: true,
            }),

            // 유효기간
            createTextParagraphInput('card_expiry', {
                label: '만료일(유효기간)',
                placeholder: 'MM/YY',
                min_length: 4,
                max_length: 5,
                required: true,
            }),

            // 주민번호 또는 사업자번호
            createTextParagraphInput('card_ssn', {
                label: '주민번호 또는 사업자번호',
                placeholder: '주민번호 또는 사업자번호를 입력해주세요',
                min_length: 6,
                max_length: 10,
                required: true,
            }),

            // 별칭
            createTextParagraphInput('card_alias', {
                label: '카드 별칭',
                placeholder: '카드 별칭을 입력해주세요',
                min_length: 1,
                max_length: 20,
                required: true,
            }),

            // 비밀번호 앞 2자리
            createTextParagraphInput('card_password', {
                label: '비밀번호 앞 2자리',
                placeholder: '비밀번호 앞 2자리를 입력해주세요',
                min_length: 2,
                max_length: 2,
                required: true,
            }),
        ],
    });
};

const CardEpireDateRegex = /(\d{2})([\/\-.]?)(\d{2})/;

export const createPayment = async (authId: string, values: Record<string, string>) => {
    const {
        card_number: cardNumber,
        card_expiry,
        card_ssn: customerIdentityNumber,
        card_alias: cardName,
        card_password: cardPassword,
    } = values;

    const expiry = card_expiry.match(CardEpireDateRegex);
    if (expiry === null) {
        return { error: '유효기간을 정확히 입력해주세요.' };
    }

    const [, month, , year] = expiry;

    return await createCard(authId, {
        cardNumber,
        cardExpirationYear: year,
        cardExpirationMonth: month,
        cardPassword,
        customerIdentityNumber,
        cardName,
    });
};

export const createPaymentOrder = async (
    interaction: IReply,
    authId: string,
    card_number: string,
    amount: number,
    orderName: string
) => {
    // 결제 요청
    if (amount < 100) {
        return interaction.reply({
            content: '결제 금액은 100원 이상이어야 합니다.',
            ephemeral: true,
        });
        // return fastify.httpErrors.badRequest('결제 금액은 100원 이상이어야 합니다.');
    }

    const userId = sha256(card_number, ENCRYPT_KEY);
    const [item] = await selectPayments(authId, userId);

    if (!item) {
        return interaction.reply({
            content: '등록된 카드가 없습니다.',
            ephemeral: true,
        });
    }

    const order = await billing(amount, orderName, item);

    const {
        receipt: { url },
        orderId,
        status,
        currency,
        suppliedAmount,
        vat,
        totalAmount,
    } = order;

    interaction.reply({
        embeds: [
            {
                title: '결제가 완료되었습니다.',
                description: `
주문번호: ${orderId}
결제 상태: ${status}
공급 가액: ${suppliedAmount}
부가세: ${vat} 

합계 : ${totalAmount} (${currency})
        `,
            },
        ],
        components: [
            createActionRow(
                createUrlButton(url, {
                    label: '영수증 확인',
                }),
                createUrlButton('http://pf.kakao.com/_xnTkmG', {
                    label: '문의하기',
                })
            ),
        ],
        ephemeral: true,
    });
};
