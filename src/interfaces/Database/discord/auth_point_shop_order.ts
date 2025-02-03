/* AUTO CREATE TABLE INTERFACE :: 1738571723194 */
/* point 구매이력 */
type COLUMN = 'order_id' | 'item_idx' | 'auth_id' | 'point' | 'name' | 'create_at' | 'use_yn';
const columns : COLUMN[] = [ 'order_id','item_idx','auth_id','point','name','create_at','use_yn' ];
const pk : COLUMN[] = [ 'order_id' ];

export const AUTH_POINT_SHOP_ORDER = 'auth_point_shop_order';
export const TABLE_COLUMNS_AUTH_POINT_SHOP_ORDER = columns;
const WHERE_AUTH_POINT_SHOP_ORDER = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_AUTH_POINT_SHOP_ORDER = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.auth_point_shop_order \nWHERE ${WHERE_AUTH_POINT_SHOP_ORDER(where)}`
export const INSERT_AUTH_POINT_SHOP_ORDER = (data: COLUMN[]) => ` INSERT INTO discord.AUTH_POINT_SHOP_ORDER SET ${WHERE_AUTH_POINT_SHOP_ORDER(data)} `
export const UPDATE_AUTH_POINT_SHOP_ORDER = (data: COLUMN[]) => ` UPDATE discord.AUTH_POINT_SHOP_ORDER SET ${WHERE_AUTH_POINT_SHOP_ORDER(data.filter(col=> !pk.includes(col)))}`
export const DELETE_AUTH_POINT_SHOP_ORDER = ` DELETE FROM discord.AUTH_POINT_SHOP_ORDER`

export interface AUTH_POINT_SHOP_ORDER {
    order_id: string;		/* KEY(PRI) char - * */
    item_idx: number;		/*  bigint - * */
    auth_id: string;		/*  char - * */
    point: number| null;		/*  bigint - 포인트 금액 */
    name: string| null;		/*  varchar - 상품명 */
    create_at: Date;		/*  datetime - * */
    use_yn: string;		/*  varchar - 주문상태 */
}