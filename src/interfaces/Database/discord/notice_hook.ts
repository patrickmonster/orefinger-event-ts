/* AUTO CREATE TABLE INTERFACE :: 1738571725697 */
/* 알림 훅 */
type COLUMN = 'channel_id' | 'guild_id' | 'create_at' | 'update_at';
const columns : COLUMN[] = [ 'channel_id','guild_id','create_at','update_at' ];
const pk : COLUMN[] = [  ];

export const NOTICE_HOOK = 'notice_hook';
export const TABLE_COLUMNS_NOTICE_HOOK = columns;
const WHERE_NOTICE_HOOK = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_NOTICE_HOOK = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.notice_hook \nWHERE ${WHERE_NOTICE_HOOK(where)}`
export const INSERT_NOTICE_HOOK = (data: COLUMN[]) => ` INSERT INTO discord.NOTICE_HOOK SET ${WHERE_NOTICE_HOOK(data)} `
export const UPDATE_NOTICE_HOOK = (data: COLUMN[]) => ` UPDATE discord.NOTICE_HOOK SET ${WHERE_NOTICE_HOOK(data.filter(col=> !pk.includes(col)))}`
export const DELETE_NOTICE_HOOK = ` UPDATE discord.NOTICE_HOOK SET use_yn = 'N'`

export interface NOTICE_HOOK {
    channel_id: string;		/*  char - * */
    guild_id: string| null;		/*  char - * */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
}