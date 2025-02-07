/* AUTO CREATE TABLE INTERFACE :: 1738571725850 */
/* 결제 상태 */
type COLUMN = 'order_state' | 'tag';
const columns : COLUMN[] = [ 'order_state','tag' ];
const pk : COLUMN[] = [ 'order_state' ];

export const PAYMENT_ORDER_STATE = 'payment_order_state';
export const TABLE_COLUMNS_PAYMENT_ORDER_STATE = columns;
const WHERE_PAYMENT_ORDER_STATE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_PAYMENT_ORDER_STATE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.payment_order_state \nWHERE ${WHERE_PAYMENT_ORDER_STATE(where)}`
export const INSERT_PAYMENT_ORDER_STATE = (data: COLUMN[]) => ` INSERT INTO discord.PAYMENT_ORDER_STATE SET ${WHERE_PAYMENT_ORDER_STATE(data)} `
export const UPDATE_PAYMENT_ORDER_STATE = (data: COLUMN[]) => ` UPDATE discord.PAYMENT_ORDER_STATE SET ${WHERE_PAYMENT_ORDER_STATE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_PAYMENT_ORDER_STATE = ` UPDATE discord.PAYMENT_ORDER_STATE SET use_yn = 'N'`

export interface PAYMENT_ORDER_STATE {
    order_state: number;		/* KEY(PRI) int - * */
    tag: string| null;		/*  varchar - * */
}