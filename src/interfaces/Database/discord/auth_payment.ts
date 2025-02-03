/* AUTO CREATE TABLE INTERFACE :: 1738571723001 */
/* 결제 */
type COLUMN = 'auth_id' | 'target_id' | 'use_yn' | 'type' | 'create_at' | 'update_at';
const columns : COLUMN[] = [ 'auth_id','target_id','use_yn','type','create_at','update_at' ];
const pk : COLUMN[] = [ 'auth_id','target_id' ];

export const AUTH_PAYMENT = 'auth_payment';
export const TABLE_COLUMNS_AUTH_PAYMENT = columns;
const WHERE_AUTH_PAYMENT = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_AUTH_PAYMENT = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.auth_payment \nWHERE ${WHERE_AUTH_PAYMENT(where)}`
export const INSERT_AUTH_PAYMENT = (data: COLUMN[]) => ` INSERT INTO discord.AUTH_PAYMENT SET ${WHERE_AUTH_PAYMENT(data)} `
export const UPDATE_AUTH_PAYMENT = (data: COLUMN[]) => ` UPDATE discord.AUTH_PAYMENT SET ${WHERE_AUTH_PAYMENT(data.filter(col=> !pk.includes(col)))}`
export const DELETE_AUTH_PAYMENT = ` DELETE FROM discord.AUTH_PAYMENT`

export interface AUTH_PAYMENT {
    auth_id: string;		/* KEY(PRI) char - * */
    target_id: string;		/* KEY(PRI) char - * */
    use_yn: string| null;		/*  varchar - 구독 활성화 여부 */
    type: number;		/* KEY(MUL) int - 구독 활성화 여부 */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
}