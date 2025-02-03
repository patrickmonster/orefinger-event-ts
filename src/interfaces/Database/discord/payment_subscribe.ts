/* AUTO CREATE TABLE INTERFACE :: 1738571725910 */
/* 구독 결제 */
type COLUMN = 'auth_id' | 'order_type' | 'use_yn' | 'error_cnt' | 'next_pay_yymm' | 'amount_discount' | 'create_at' | 'update_at' | 'payment_at';
const columns : COLUMN[] = [ 'auth_id','order_type','use_yn','error_cnt','next_pay_yymm','amount_discount','create_at','update_at','payment_at' ];
const pk : COLUMN[] = [ 'auth_id','order_type' ];

export const PAYMENT_SUBSCRIBE = 'payment_subscribe';
export const TABLE_COLUMNS_PAYMENT_SUBSCRIBE = columns;
const WHERE_PAYMENT_SUBSCRIBE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_PAYMENT_SUBSCRIBE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.payment_subscribe \nWHERE ${WHERE_PAYMENT_SUBSCRIBE(where)}`
export const INSERT_PAYMENT_SUBSCRIBE = (data: COLUMN[]) => ` INSERT INTO discord.PAYMENT_SUBSCRIBE SET ${WHERE_PAYMENT_SUBSCRIBE(data)} `
export const UPDATE_PAYMENT_SUBSCRIBE = (data: COLUMN[]) => ` UPDATE discord.PAYMENT_SUBSCRIBE SET ${WHERE_PAYMENT_SUBSCRIBE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_PAYMENT_SUBSCRIBE = ` DELETE FROM discord.PAYMENT_SUBSCRIBE`

export interface PAYMENT_SUBSCRIBE {
    auth_id: string;		/* KEY(PRI) char - 사용자 */
    order_type: number;		/* KEY(PRI) bigint - 결제 아이템 */
    use_yn: string| null;		/*  varchar - 사용여부 */
    error_cnt: number| null;		/*  int - 결제 실패 카운트
3회 이상인 경우 결제 중지 처리 */
    next_pay_yymm: string;		/*  char - 다음 결제월 */
    amount_discount: number| null;		/*  int - 할인가격 - 사용자 개별

할인된 금액은 양수로..
추가 금액은 음수로 */
    create_at: Date| null;		/*  datetime - * */
    update_at: Date| null;		/*  datetime - * */
    payment_at: Date| null;		/*  datetime - 마지막결제 */
}