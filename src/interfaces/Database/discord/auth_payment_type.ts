/* AUTO CREATE TABLE INTERFACE :: 1738571723034 */
/* 결제 타겟 타입 */
type COLUMN = 'type' | 'tag';
const columns : COLUMN[] = [ 'type','tag' ];
const pk : COLUMN[] = [ 'type' ];

export const AUTH_PAYMENT_TYPE = 'auth_payment_type';
export const TABLE_COLUMNS_AUTH_PAYMENT_TYPE = columns;
const WHERE_AUTH_PAYMENT_TYPE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_AUTH_PAYMENT_TYPE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.auth_payment_type \nWHERE ${WHERE_AUTH_PAYMENT_TYPE(where)}`
export const INSERT_AUTH_PAYMENT_TYPE = (data: COLUMN[]) => ` INSERT INTO discord.AUTH_PAYMENT_TYPE SET ${WHERE_AUTH_PAYMENT_TYPE(data)} `
export const UPDATE_AUTH_PAYMENT_TYPE = (data: COLUMN[]) => ` UPDATE discord.AUTH_PAYMENT_TYPE SET ${WHERE_AUTH_PAYMENT_TYPE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_AUTH_PAYMENT_TYPE = ` UPDATE discord.AUTH_PAYMENT_TYPE SET use_yn = 'N'`

export interface AUTH_PAYMENT_TYPE {
    type: number;		/* KEY(PRI) int - 구독 활성화 여부 */
    tag: string| null;		/*  varchar - * */
}