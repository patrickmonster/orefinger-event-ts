import { query } from 'utils/database';

export interface Payment {
    type: number;
    user_id: string;
    auth_id: string;
    login: string;
    name: string;
    kr_name: string;
    user_type: number;
    email: string;
    avatar: string;
    avatar_id: string;
    refresh_token: string;
    is_session: 'Y' | 'N';
    create_at: string;
    update_at: string;
}

export type PaymentHidden<T extends true | false> = Payment & (T extends true ? { refresh_token: string } : {});

export const selectCardList = async (id: string) =>
    query<{
        user_id: string;
        auth_id: string;
        name: string;
        avatar: string;
        avatar_id: string;
        is_session: 'Y' | 'N' | boolean;
        create_at: string;
        update_at: string;
    }>(
        `
SELECT user_id
	, auth_id
	, name
	, avatar
	, avatar_id
	, is_session -- 마지막 결제 요청이 유효한지
	, create_at
	, update_at 
FROM v_auth_token vat 
WHERE vat.\`type\` = 10
AND vat.auth_id = ?
        `,
        id
    );
