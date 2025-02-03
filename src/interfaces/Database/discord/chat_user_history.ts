/* AUTO CREATE TABLE INTERFACE :: 1738571723866 */
/* 이력 */
type COLUMN = 'channel_id' | 'user_id' | 'create_at' | 'point' | 'message';
const columns : COLUMN[] = [ 'channel_id','user_id','create_at','point','message' ];
const pk : COLUMN[] = [  ];

export const CHAT_USER_HISTORY = 'chat_user_history';
export const TABLE_COLUMNS_CHAT_USER_HISTORY = columns;
const WHERE_CHAT_USER_HISTORY = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_CHAT_USER_HISTORY = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.chat_user_history \nWHERE ${WHERE_CHAT_USER_HISTORY(where)}`
export const INSERT_CHAT_USER_HISTORY = (data: COLUMN[]) => ` INSERT INTO discord.CHAT_USER_HISTORY SET ${WHERE_CHAT_USER_HISTORY(data)} `
export const UPDATE_CHAT_USER_HISTORY = (data: COLUMN[]) => ` UPDATE discord.CHAT_USER_HISTORY SET ${WHERE_CHAT_USER_HISTORY(data.filter(col=> !pk.includes(col)))}`
export const DELETE_CHAT_USER_HISTORY = ` UPDATE discord.CHAT_USER_HISTORY SET use_yn = 'N'`

export interface CHAT_USER_HISTORY {
    channel_id: string;		/* KEY(MUL) char - * */
    user_id: string;		/*  char - * */
    create_at: Date;		/*  timestamp - * */
    point: number;		/*  bigint - 영문 이름 */
    message: string;		/*  varchar - 영문 이름 */
}