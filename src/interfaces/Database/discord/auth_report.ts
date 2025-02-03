/* AUTO CREATE TABLE INTERFACE :: 1738571723233 */
/* 신고 */
type COLUMN = 'auth_id' | 'user_id' | 'use_yn' | 'create_at' | 'update_at' | 'commant';
const columns : COLUMN[] = [ 'auth_id','user_id','use_yn','create_at','update_at','commant' ];
const pk : COLUMN[] = [ 'auth_id','user_id' ];

export const AUTH_REPORT = 'auth_report';
export const TABLE_COLUMNS_AUTH_REPORT = columns;
const WHERE_AUTH_REPORT = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_AUTH_REPORT = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.auth_report \nWHERE ${WHERE_AUTH_REPORT(where)}`
export const INSERT_AUTH_REPORT = (data: COLUMN[]) => ` INSERT INTO discord.AUTH_REPORT SET ${WHERE_AUTH_REPORT(data)} `
export const UPDATE_AUTH_REPORT = (data: COLUMN[]) => ` UPDATE discord.AUTH_REPORT SET ${WHERE_AUTH_REPORT(data.filter(col=> !pk.includes(col)))}`
export const DELETE_AUTH_REPORT = ` DELETE FROM discord.AUTH_REPORT`

export interface AUTH_REPORT {
    auth_id: string;		/* KEY(PRI) char - 사용자 */
    user_id: string;		/* KEY(PRI) char - 신고자 */
    use_yn: string;		/*  varchar - 사용유무 */
    create_at: Date;		/*  timestamp - * */
    update_at: Date;		/*  timestamp - * */
    commant: string| null;		/*  text - * */
}