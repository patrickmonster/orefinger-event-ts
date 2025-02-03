/* AUTO CREATE TABLE INTERFACE :: 1738571722882 */
/* 사용자 개별 옵션 */
type COLUMN = 'auth_id' | 'type' | 'use_yn' | 'create_at' | 'update_at' | 'last_order';
const columns : COLUMN[] = [ 'auth_id','type','use_yn','create_at','update_at','last_order' ];
const pk : COLUMN[] = [ 'auth_id','type' ];

export const AUTH_OPTION = 'auth_option';
export const TABLE_COLUMNS_AUTH_OPTION = columns;
const WHERE_AUTH_OPTION = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_AUTH_OPTION = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.auth_option \nWHERE ${WHERE_AUTH_OPTION(where)}`
export const INSERT_AUTH_OPTION = (data: COLUMN[]) => ` INSERT INTO discord.AUTH_OPTION SET ${WHERE_AUTH_OPTION(data)} `
export const UPDATE_AUTH_OPTION = (data: COLUMN[]) => ` UPDATE discord.AUTH_OPTION SET ${WHERE_AUTH_OPTION(data.filter(col=> !pk.includes(col)))}`
export const DELETE_AUTH_OPTION = ` DELETE FROM discord.AUTH_OPTION`

export interface AUTH_OPTION {
    auth_id: string;		/* KEY(PRI) char - * */
    type: number;		/* KEY(PRI) int - 구독 활성화 여부 */
    use_yn: string| null;		/*  varchar - 구독 활성화 여부 */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
    last_order: Date| null;		/*  timestamp - * */
}