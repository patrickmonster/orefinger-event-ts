/* AUTO CREATE TABLE INTERFACE :: 1738571725880 */
/* 주문 아이템 */
type COLUMN = 'order_idx' | 'order_name' | 'amount' | 'create_at' | 'update_at' | 'use_yn';
const columns : COLUMN[] = [ 'order_idx','order_name','amount','create_at','update_at','use_yn' ];
const pk : COLUMN[] = [ 'order_idx' ];

export const PAYMENT_ORDER_TYPE = 'payment_order_type';
export const TABLE_COLUMNS_PAYMENT_ORDER_TYPE = columns;
const WHERE_PAYMENT_ORDER_TYPE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_PAYMENT_ORDER_TYPE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.payment_order_type \nWHERE ${WHERE_PAYMENT_ORDER_TYPE(where)}`
export const INSERT_PAYMENT_ORDER_TYPE = (data: COLUMN[]) => ` INSERT INTO discord.PAYMENT_ORDER_TYPE SET ${WHERE_PAYMENT_ORDER_TYPE(data)} `
export const UPDATE_PAYMENT_ORDER_TYPE = (data: COLUMN[]) => ` UPDATE discord.PAYMENT_ORDER_TYPE SET ${WHERE_PAYMENT_ORDER_TYPE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_PAYMENT_ORDER_TYPE = ` DELETE FROM discord.PAYMENT_ORDER_TYPE`

export interface PAYMENT_ORDER_TYPE {
    order_idx: number;		/* KEY(PRI) bigint - * */
    order_name: string| null;		/*  varchar - * */
    amount: number| null;		/*  int - 가격 */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
    use_yn: string| null;		/*  char - 사용여부 */
}