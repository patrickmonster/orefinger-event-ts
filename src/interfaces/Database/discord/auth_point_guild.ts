/* AUTO CREATE TABLE INTERFACE :: 1738571723096 */
/* point 길드 옵션 */
type COLUMN = 'auth_id' | 'guild_id' | 'guild_name' | 'create_at' | 'update_at' | 'channel_id';
const columns : COLUMN[] = [ 'auth_id','guild_id','guild_name','create_at','update_at','channel_id' ];
const pk : COLUMN[] = [ 'guild_id' ];

export const AUTH_POINT_GUILD = 'auth_point_guild';
export const TABLE_COLUMNS_AUTH_POINT_GUILD = columns;
const WHERE_AUTH_POINT_GUILD = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_AUTH_POINT_GUILD = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.auth_point_guild \nWHERE ${WHERE_AUTH_POINT_GUILD(where)}`
export const INSERT_AUTH_POINT_GUILD = (data: COLUMN[]) => ` INSERT INTO discord.AUTH_POINT_GUILD SET ${WHERE_AUTH_POINT_GUILD(data)} `
export const UPDATE_AUTH_POINT_GUILD = (data: COLUMN[]) => ` UPDATE discord.AUTH_POINT_GUILD SET ${WHERE_AUTH_POINT_GUILD(data.filter(col=> !pk.includes(col)))}`
export const DELETE_AUTH_POINT_GUILD = ` UPDATE discord.AUTH_POINT_GUILD SET use_yn = 'N'`

export interface AUTH_POINT_GUILD {
    auth_id: string;		/*  char - * */
    guild_id: string;		/* KEY(PRI) char - * */
    guild_name: string;		/*  varchar - * */
    create_at: Date;		/*  datetime - * */
    update_at: Date;		/*  datetime - * */
    channel_id: string;		/*  char - * */
}