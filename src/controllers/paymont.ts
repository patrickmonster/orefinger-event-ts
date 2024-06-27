import { calTo, query } from 'utils/database';

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

export const selectPayments = async (authId: string, userId?: string) =>
    query<PaymentHidden<typeof userId extends string ? true : false>>(
        `
SELECT \`type\`
    , user_id
    , auth_id
    , login
    , name
    , kr_name
    , user_type
    , email
    , avatar
    , avatar_id
    ${userId ? '' : '-- '}, refresh_token
    , is_session
    , create_at
    , update_at
FROM v_auth_token vat
WHERE 1=1
AND vat.type IN (11, 10)
AND vat.auth_id = ?
${calTo('AND vat.user_id = ?', userId)}
    `,
        authId
    );

export const insertPayment = async (payment: {
    order_id: string;
    auth_id: string;
    order_state: number;
    amount: number;
}) => query(`INSERT INTO discord.payment_order set ? `, payment);

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
