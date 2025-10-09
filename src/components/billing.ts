import { selectCardList } from 'controllers/paymont';
import moment from 'moment';
import menuComponentBuild from 'utils/menuComponentBuild';

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
