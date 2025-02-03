/* AUTO CREATE TABLE INTERFACE :: 1738571722855 */
/* jwt 토큰 관리자
생성시간 + 난수(10) + 사용자 id


추후 사용하지 않음 - JWT로 변경 */
type COLUMN = 'auth_id' | 'hash' | 'create_at';
const columns : COLUMN[] = [ 'auth_id','hash','create_at' ];
const pk : COLUMN[] = [ 'auth_id' ];

export const AUTH_JWT = 'auth_jwt';
export const TABLE_COLUMNS_AUTH_JWT = columns;
const WHERE_AUTH_JWT = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_AUTH_JWT = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.auth_jwt \nWHERE ${WHERE_AUTH_JWT(where)}`
export const INSERT_AUTH_JWT = (data: COLUMN[]) => ` INSERT INTO discord.AUTH_JWT SET ${WHERE_AUTH_JWT(data)} `
export const UPDATE_AUTH_JWT = (data: COLUMN[]) => ` UPDATE discord.AUTH_JWT SET ${WHERE_AUTH_JWT(data.filter(col=> !pk.includes(col)))}`
export const DELETE_AUTH_JWT = ` UPDATE discord.AUTH_JWT SET use_yn = 'N'`

export interface AUTH_JWT {
    auth_id: string;		/* KEY(PRI) char - * */
    hash: string| null;		/* KEY(UNI) varchar - * */
    create_at: Date| null;		/*  timestamp - 생성시간 */
}