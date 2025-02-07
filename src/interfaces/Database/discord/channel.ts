/* AUTO CREATE TABLE INTERFACE :: 1738571723470 */
/* 디스코드 - 채널 */
type COLUMN = 'channel_id' | 'guild_id' | 'name' | 'type' | 'create_at' | 'update_at' | 'is_use';
const columns : COLUMN[] = [ 'channel_id','guild_id','name','type','create_at','update_at','is_use' ];
const pk : COLUMN[] = [ 'channel_id' ];

export const CHANNEL = 'channel';
export const TABLE_COLUMNS_CHANNEL = columns;
const WHERE_CHANNEL = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_CHANNEL = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.channel \nWHERE ${WHERE_CHANNEL(where)}`
export const INSERT_CHANNEL = (data: COLUMN[]) => ` INSERT INTO discord.CHANNEL SET ${WHERE_CHANNEL(data)} `
export const UPDATE_CHANNEL = (data: COLUMN[]) => ` UPDATE discord.CHANNEL SET ${WHERE_CHANNEL(data.filter(col=> !pk.includes(col)))}`
export const DELETE_CHANNEL = ` UPDATE discord.CHANNEL SET use_yn = 'N'`

export interface CHANNEL {
    channel_id: string;		/* KEY(PRI) char - * */
    guild_id: string;		/* KEY(MUL) char - * */
    name: string| null;		/*  varchar - * */
    type: number| null;		/*  int - 채널타입 - 유형\n\n */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
    is_use: string;		/*  varchar - * */
}