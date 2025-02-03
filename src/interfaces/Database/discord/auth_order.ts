/* AUTO CREATE TABLE INTERFACE :: 1738571722941 */
/* 사용자 결제 이력 */
type COLUMN = 'auth_id' | 'idx' | 'order_idx' | 'create_at' | 'update_at' | 'card_number' | 'order_price';
const columns : COLUMN[] = [ 'auth_id','idx','order_idx','create_at','update_at','card_number','order_price' ];
const pk : COLUMN[] = [ 'idx' ];

export const AUTH_ORDER = 'auth_order';
export const TABLE_COLUMNS_AUTH_ORDER = columns;
const WHERE_AUTH_ORDER = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_AUTH_ORDER = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.auth_order \nWHERE ${WHERE_AUTH_ORDER(where)}`
export const INSERT_AUTH_ORDER = (data: COLUMN[]) => ` INSERT INTO discord.AUTH_ORDER SET ${WHERE_AUTH_ORDER(data)} `
export const UPDATE_AUTH_ORDER = (data: COLUMN[]) => ` UPDATE discord.AUTH_ORDER SET ${WHERE_AUTH_ORDER(data.filter(col=> !pk.includes(col)))}`
export const DELETE_AUTH_ORDER = ` UPDATE discord.AUTH_ORDER SET use_yn = 'N'`

export interface AUTH_ORDER {
    auth_id: string;		/* KEY(MUL) char - * */
    idx: number;		/* KEY(PRI) bigint - * */
    order_idx: string| null;		/*  varchar - * */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
    card_number: string| null;		/*  varchar - * */
    order_price: number| null;		/*  int - * */
}