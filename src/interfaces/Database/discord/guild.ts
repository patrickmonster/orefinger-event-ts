/* AUTO CREATE TABLE INTERFACE :: 1738571724994 */
/* 길드정보 */
type COLUMN = 'guild_id' | 'name' | 'owner_id' | 'create_at' | 'update_at' | 'is_use';
const columns : COLUMN[] = [ 'guild_id','name','owner_id','create_at','update_at','is_use' ];
const pk : COLUMN[] = [ 'guild_id' ];

export const GUILD = 'guild';
export const TABLE_COLUMNS_GUILD = columns;
const WHERE_GUILD = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_GUILD = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.guild \nWHERE ${WHERE_GUILD(where)}`
export const INSERT_GUILD = (data: COLUMN[]) => ` INSERT INTO discord.GUILD SET ${WHERE_GUILD(data)} `
export const UPDATE_GUILD = (data: COLUMN[]) => ` UPDATE discord.GUILD SET ${WHERE_GUILD(data.filter(col=> !pk.includes(col)))}`
export const DELETE_GUILD = ` UPDATE discord.GUILD SET use_yn = 'N'`

export interface GUILD {
    guild_id: string;		/* KEY(PRI) char - * */
    name: string| null;		/*  char - * */
    owner_id: string| null;		/* KEY(MUL) char - 소유자 */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
    is_use: string;		/*  char - * */
}