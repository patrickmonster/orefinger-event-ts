/* AUTO CREATE TABLE INTERFACE :: 1738571723712 */
/* 채팅 권한 */
type COLUMN = 'channel_id' | 'user_id' | 'type' | 'create_at';
const columns : COLUMN[] = [ 'channel_id','user_id','type','create_at' ];
const pk : COLUMN[] = [ 'channel_id','user_id' ];

export const CHAT_PERMISSION = 'chat_permission';
export const TABLE_COLUMNS_CHAT_PERMISSION = columns;
const WHERE_CHAT_PERMISSION = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_CHAT_PERMISSION = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.chat_permission \nWHERE ${WHERE_CHAT_PERMISSION(where)}`
export const INSERT_CHAT_PERMISSION = (data: COLUMN[]) => ` INSERT INTO discord.CHAT_PERMISSION SET ${WHERE_CHAT_PERMISSION(data)} `
export const UPDATE_CHAT_PERMISSION = (data: COLUMN[]) => ` UPDATE discord.CHAT_PERMISSION SET ${WHERE_CHAT_PERMISSION(data.filter(col=> !pk.includes(col)))}`
export const DELETE_CHAT_PERMISSION = ` UPDATE discord.CHAT_PERMISSION SET use_yn = 'N'`

export interface CHAT_PERMISSION {
    channel_id: string;		/* KEY(PRI) char - 채널 정보 */
    user_id: string;		/* KEY(PRI) char - 채널 정보 */
    type: number;		/* KEY(MUL) int - 권한타입 */
    create_at: Date;		/*  timestamp - * */
}