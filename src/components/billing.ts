import { PaymentHidden, insertPayment } from 'controllers/paymont';
import { ENCRYPT_KEY, sha256 } from 'utils/cryptoPw';
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

export const billing = async (amount: number, orderName: string, item: PaymentHidden<true>) => {
    const orderId = sha256(`${item.refresh_token}${Date.now()}`, ENCRYPT_KEY);

    const data = await toss.post<{
        status: OrderState;
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
