/* AUTO CREATE TABLE INTERFACE :: 1738571725824 */
/* 구매이력
- 1000원이하는 결제하지 않음 */
type COLUMN = 'order_id' | 'auth_id' | 'order_state' | 'amount' | 'create_at' | 'update_at';
const columns : COLUMN[] = [ 'order_id','auth_id','order_state','amount','create_at','update_at' ];
const pk : COLUMN[] = [ 'order_id' ];

export const PAYMENT_ORDER = 'payment_order';
export const TABLE_COLUMNS_PAYMENT_ORDER = columns;
const WHERE_PAYMENT_ORDER = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_PAYMENT_ORDER = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.payment_order \nWHERE ${WHERE_PAYMENT_ORDER(where)}`
export const INSERT_PAYMENT_ORDER = (data: COLUMN[]) => ` INSERT INTO discord.PAYMENT_ORDER SET ${WHERE_PAYMENT_ORDER(data)} `
export const UPDATE_PAYMENT_ORDER = (data: COLUMN[]) => ` UPDATE discord.PAYMENT_ORDER SET ${WHERE_PAYMENT_ORDER(data.filter(col=> !pk.includes(col)))}`
export const DELETE_PAYMENT_ORDER = ` UPDATE discord.PAYMENT_ORDER SET use_yn = 'N'`

export interface PAYMENT_ORDER {
    order_id: string;		/* KEY(PRI) varchar - * */
    auth_id: string;		/* KEY(MUL) char - * */
    order_state: number| null;		/*  int - 주문상태 */
    amount: number;		/*  int - 결제대금 */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
}