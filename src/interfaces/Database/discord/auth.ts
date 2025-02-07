/* AUTO CREATE TABLE INTERFACE :: 1738571722754 */
/* Discord user data */
type COLUMN = 'auth_id' | 'name' | 'username' | 'tag' | 'avatar' | 'create_at' | 'update_at';
const columns : COLUMN[] = [ 'auth_id','name','username','tag','avatar','create_at','update_at' ];
const pk : COLUMN[] = [ 'auth_id' ];

export const AUTH = 'auth';
export const TABLE_COLUMNS_AUTH = columns;
const WHERE_AUTH = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_AUTH = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.auth \nWHERE ${WHERE_AUTH(where)}`
export const INSERT_AUTH = (data: COLUMN[]) => ` INSERT INTO discord.AUTH SET ${WHERE_AUTH(data)} `
export const UPDATE_AUTH = (data: COLUMN[]) => ` UPDATE discord.AUTH SET ${WHERE_AUTH(data.filter(col=> !pk.includes(col)))}`
export const DELETE_AUTH = ` UPDATE discord.AUTH SET use_yn = 'N'`

export interface AUTH {
    auth_id: string;		/* KEY(PRI) char - * */
    name: string| null;		/*  char - 사용자 테그 */
    username: string| null;		/*  char - 사용자 테그 */
    tag: string| null;		/*  varchar - 4자리 구분id */
    avatar: string| null;		/*  varchar - 아바타 이미지 */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
}