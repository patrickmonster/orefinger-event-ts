/* AUTO CREATE TABLE INTERFACE :: 1738571723824 */
/* 방문기록 */
type COLUMN = 'channel_id' | 'user_id' | 'create_at' | 'update_at' | 'point';
const columns : COLUMN[] = [ 'channel_id','user_id','create_at','update_at','point' ];
const pk : COLUMN[] = [ 'channel_id','user_id' ];

export const CHAT_USER_CONNECT = 'chat_user_connect';
export const TABLE_COLUMNS_CHAT_USER_CONNECT = columns;
const WHERE_CHAT_USER_CONNECT = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_CHAT_USER_CONNECT = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.chat_user_connect \nWHERE ${WHERE_CHAT_USER_CONNECT(where)}`
export const INSERT_CHAT_USER_CONNECT = (data: COLUMN[]) => ` INSERT INTO discord.CHAT_USER_CONNECT SET ${WHERE_CHAT_USER_CONNECT(data)} `
export const UPDATE_CHAT_USER_CONNECT = (data: COLUMN[]) => ` UPDATE discord.CHAT_USER_CONNECT SET ${WHERE_CHAT_USER_CONNECT(data.filter(col=> !pk.includes(col)))}`
export const DELETE_CHAT_USER_CONNECT = ` UPDATE discord.CHAT_USER_CONNECT SET use_yn = 'N'`

export interface CHAT_USER_CONNECT {
    channel_id: string;		/* KEY(PRI) char - * */
    user_id: string;		/* KEY(PRI) char - * */
    create_at: Date;		/*  timestamp - * */
    update_at: Date;		/*  timestamp - * */
    point: number;		/*  bigint - 영문 이름 */
}