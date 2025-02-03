/* AUTO CREATE TABLE INTERFACE :: 1738571723124 */
/* point 로그 관리 테이블 */
type COLUMN = 'idx' | 'auth_id' | 'guild_id' | 'point' | 'point_old' | 'message' | 'create_at';
const columns : COLUMN[] = [ 'idx','auth_id','guild_id','point','point_old','message','create_at' ];
const pk : COLUMN[] = [ 'idx' ];

export const AUTH_POINT_LOG = 'auth_point_log';
export const TABLE_COLUMNS_AUTH_POINT_LOG = columns;
const WHERE_AUTH_POINT_LOG = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_AUTH_POINT_LOG = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.auth_point_log \nWHERE ${WHERE_AUTH_POINT_LOG(where)}`
export const INSERT_AUTH_POINT_LOG = (data: COLUMN[]) => ` INSERT INTO discord.AUTH_POINT_LOG SET ${WHERE_AUTH_POINT_LOG(data)} `
export const UPDATE_AUTH_POINT_LOG = (data: COLUMN[]) => ` UPDATE discord.AUTH_POINT_LOG SET ${WHERE_AUTH_POINT_LOG(data.filter(col=> !pk.includes(col)))}`
export const DELETE_AUTH_POINT_LOG = ` UPDATE discord.AUTH_POINT_LOG SET use_yn = 'N'`

export interface AUTH_POINT_LOG {
    idx: number;		/* KEY(PRI) bigint - * */
    auth_id: string;		/* KEY(MUL) char - * */
    guild_id: string;		/*  char - * */
    point: number;		/*  bigint - 포인트 금액 */
    point_old: number| null;		/*  bigint - 포인트 금액 */
    message: string| null;		/*  varchar - 사용자 테그 */
    create_at: Date;		/*  datetime - * */
}