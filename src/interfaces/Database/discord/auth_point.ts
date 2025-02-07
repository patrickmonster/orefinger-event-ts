/* AUTO CREATE TABLE INTERFACE :: 1738571723067 */
/* point 관리 테이블 */
type COLUMN = 'auth_id' | 'guild_id' | 'point' | 'create_at' | 'update_at';
const columns : COLUMN[] = [ 'auth_id','guild_id','point','create_at','update_at' ];
const pk : COLUMN[] = [ 'auth_id','guild_id' ];

export const AUTH_POINT = 'auth_point';
export const TABLE_COLUMNS_AUTH_POINT = columns;
const WHERE_AUTH_POINT = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_AUTH_POINT = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.auth_point \nWHERE ${WHERE_AUTH_POINT(where)}`
export const INSERT_AUTH_POINT = (data: COLUMN[]) => ` INSERT INTO discord.AUTH_POINT SET ${WHERE_AUTH_POINT(data)} `
export const UPDATE_AUTH_POINT = (data: COLUMN[]) => ` UPDATE discord.AUTH_POINT SET ${WHERE_AUTH_POINT(data.filter(col=> !pk.includes(col)))}`
export const DELETE_AUTH_POINT = ` UPDATE discord.AUTH_POINT SET use_yn = 'N'`

export interface AUTH_POINT {
    auth_id: string;		/* KEY(PRI) char - * */
    guild_id: string;		/* KEY(PRI) char - * */
    point: number| null;		/*  bigint - 포인트 금액 */
    create_at: Date;		/*  datetime - * */
    update_at: Date;		/*  datetime - * */
}