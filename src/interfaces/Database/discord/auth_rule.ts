/* AUTO CREATE TABLE INTERFACE :: 1738571723269 */
/* 인증 - 사용자 인증을 한 경우 */
type COLUMN = 'auth_id' | 'guild_id' | 'type' | 'create_at' | 'update_at';
const columns : COLUMN[] = [ 'auth_id','guild_id','type','create_at','update_at' ];
const pk : COLUMN[] = [ 'auth_id','guild_id','type' ];

export const AUTH_RULE = 'auth_rule';
export const TABLE_COLUMNS_AUTH_RULE = columns;
const WHERE_AUTH_RULE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_AUTH_RULE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.auth_rule \nWHERE ${WHERE_AUTH_RULE(where)}`
export const INSERT_AUTH_RULE = (data: COLUMN[]) => ` INSERT INTO discord.AUTH_RULE SET ${WHERE_AUTH_RULE(data)} `
export const UPDATE_AUTH_RULE = (data: COLUMN[]) => ` UPDATE discord.AUTH_RULE SET ${WHERE_AUTH_RULE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_AUTH_RULE = ` UPDATE discord.AUTH_RULE SET use_yn = 'N'`

export interface AUTH_RULE {
    auth_id: string;		/* KEY(PRI) char - * */
    guild_id: string;		/* KEY(PRI) char - 인증서버 */
    type: number;		/* KEY(PRI) int - * */
    create_at: Date| null;		/*  datetime - 인증시간 */
    update_at: Date;		/*  timestamp - 업데이트 시간 */
}