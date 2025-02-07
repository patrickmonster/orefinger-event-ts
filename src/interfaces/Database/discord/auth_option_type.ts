/* AUTO CREATE TABLE INTERFACE :: 1738571722909 */
/* 사용자 개별 옵션 */
type COLUMN = 'type' | 'price' | 'use_yn' | 'name';
const columns : COLUMN[] = [ 'type','price','use_yn','name' ];
const pk : COLUMN[] = [ 'type' ];

export const AUTH_OPTION_TYPE = 'auth_option_type';
export const TABLE_COLUMNS_AUTH_OPTION_TYPE = columns;
const WHERE_AUTH_OPTION_TYPE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_AUTH_OPTION_TYPE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.auth_option_type \nWHERE ${WHERE_AUTH_OPTION_TYPE(where)}`
export const INSERT_AUTH_OPTION_TYPE = (data: COLUMN[]) => ` INSERT INTO discord.AUTH_OPTION_TYPE SET ${WHERE_AUTH_OPTION_TYPE(data)} `
export const UPDATE_AUTH_OPTION_TYPE = (data: COLUMN[]) => ` UPDATE discord.AUTH_OPTION_TYPE SET ${WHERE_AUTH_OPTION_TYPE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_AUTH_OPTION_TYPE = ` DELETE FROM discord.AUTH_OPTION_TYPE`

export interface AUTH_OPTION_TYPE {
    type: number;		/* KEY(PRI) int - 타입 */
    price: number;		/*  int - 가격 */
    use_yn: string| null;		/*  varchar - 구독 활성화 여부 */
    name: string| null;		/*  varchar - * */
}