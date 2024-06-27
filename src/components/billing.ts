import { auth } from 'controllers/auth';
import { PaymentHidden, insertPayment, selectCardList } from 'controllers/paymont';
import { AuthorizationsCard, Card } from 'interfaces/toss';
import moment from 'moment';
import { ENCRYPT_KEY, encrypt, sha256 } from 'utils/cryptoPw';
import menuComponentBuild from 'utils/menuComponentBuild';
import toss from 'utils/tossApiInstance';

type OrderState =
    | 'READY'
    | 'IN_PROGRESS'
    | 'DONE'
    | 'CANCELED'
    | 'PARTIAL_CANCELED'
    | 'ABORTED'
    | 'WAITING_FOR_DEPOSIT'
    | 'EXPIRED';

const getBillingState = (orderState: OrderState) => {
    switch (orderState) {
        case 'READY': // 결제 준비
        case 'IN_PROGRESS': // 인증 완료
            return 0;
        case 'DONE': // 결제 완료
            return 2;
        case 'CANCELED': // 결제 취소
            return 5;
        case 'PARTIAL_CANCELED': // 부분취소
            return 2;
        case 'ABORTED': // 승인 실패
        case 'WAITING_FOR_DEPOSIT': // 입금 대기중
            return 0;
        case 'EXPIRED': // 결제 만료
            return 1;
        default:
            return 0;
    }
};

export const getCardList = async (id: string, custom_id: string) => {
    return selectCardList(id).then(card => {
        switch (card.length) {
            case 0:
                throw new Error('Not found Card');
            case 1:
                return card[0];
            default:
                return menuComponentBuild(
                    {
                        custom_id,
                        placeholder: '인증을 완료하실 계정을 선택 해 주세요!',
                        disabled: false,
                        max_values: 1,
                        min_values: 1,
                    },
                    ...card.map(({ user_id, name, create_at }) => ({
                        label: `${name}`,
                        value: user_id,
                        description: `${moment(create_at).format('YYYY년 MMM Do')} 등록됨`,
                    }))
                );
        }
    });
};

export const createCard = async (id: string, card: Card, isTest = false) => {
    const { cardNumber, cardExpirationYear, cardExpirationMonth, cardPassword, customerIdentityNumber, cardName } =
        card;

    const user = await toss.post<AuthorizationsCard>('/billing/authorizations/card', {
        cardNumber,
        cardExpirationYear,
        cardExpirationMonth,
        cardPassword,
        customerIdentityNumber,
        customerKey: id,
    });

    // 카드 정보 암호화
    const cardKey = sha256(cardNumber, ENCRYPT_KEY);
    const { iv, content } = encrypt(cardNumber, ENCRYPT_KEY);

    await auth(
        isTest ? 'toss.test' : 'toss',
        id,
        {
            id: cardKey, // 단방향 암호화 카드 번호
            username: iv, // 1회용 단일 인증 암호
            discriminator: cardName,
            email: content, // 양뱡향 암호호된 카드 번호
            avatar: user.mId,
        },
        user.billingKey
    );

    return cardKey;
};

export const billing = async (amount: number, orderName: string, item: PaymentHidden<true>) => {
    const orderId = sha256(`${item.refresh_token}${Date.now()}`, ENCRYPT_KEY);

    const data = await toss.post<{
        status: OrderState;
        receipt: { url: string };
        orderId: string;
        orderName: string;

        currency: string;
        suppliedAmount: number;
        vat: number;
        totalAmount: number;
    }>(`billing/${item.refresh_token}`, {
        amount,
        customerKey: item.auth_id,
        orderId,
        orderName,
    });

    await insertPayment({
        order_id: orderId,
        auth_id: item.auth_id,
        order_state: getBillingState(data.status),
        amount,
    });

    return data;
};
