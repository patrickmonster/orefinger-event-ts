/* AUTO CREATE TABLE INTERFACE :: 1738571725035 */
/* 길드 초대 이력 */
type COLUMN = 'guild_id' | 'owner_id' | 'permission' | 'invite_at';
const columns : COLUMN[] = [ 'guild_id','owner_id','permission','invite_at' ];
const pk : COLUMN[] = [  ];

export const GUILD_INVITE = 'guild_invite';
export const TABLE_COLUMNS_GUILD_INVITE = columns;
const WHERE_GUILD_INVITE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_GUILD_INVITE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.guild_invite \nWHERE ${WHERE_GUILD_INVITE(where)}`
export const INSERT_GUILD_INVITE = (data: COLUMN[]) => ` INSERT INTO discord.GUILD_INVITE SET ${WHERE_GUILD_INVITE(data)} `
export const UPDATE_GUILD_INVITE = (data: COLUMN[]) => ` UPDATE discord.GUILD_INVITE SET ${WHERE_GUILD_INVITE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_GUILD_INVITE = ` UPDATE discord.GUILD_INVITE SET use_yn = 'N'`

export interface GUILD_INVITE {
    guild_id: string;		/* KEY(MUL) char - * */
    owner_id: string;		/* KEY(MUL) char - 소유자 */
    permission: string| null;		/*  varchar - 권한 */
    invite_at: Date| null;		/*  timestamp - * */
}