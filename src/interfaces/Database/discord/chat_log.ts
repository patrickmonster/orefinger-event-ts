/* AUTO CREATE TABLE INTERFACE :: 1738571723679 */
/* 채팅 이력 */
type COLUMN = 'message_id' | 'user_id' | 'channel_id' | 'message' | 'os_type' | 'create_at' | 'hidden_yn';
const columns : COLUMN[] = [ 'message_id','user_id','channel_id','message','os_type','create_at','hidden_yn' ];
const pk : COLUMN[] = [ 'message_id' ];

export const CHAT_LOG = 'chat_log';
export const TABLE_COLUMNS_CHAT_LOG = columns;
const WHERE_CHAT_LOG = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_CHAT_LOG = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.chat_log \nWHERE ${WHERE_CHAT_LOG(where)}`
export const INSERT_CHAT_LOG = (data: COLUMN[]) => ` INSERT INTO discord.CHAT_LOG SET ${WHERE_CHAT_LOG(data)} `
export const UPDATE_CHAT_LOG = (data: COLUMN[]) => ` UPDATE discord.CHAT_LOG SET ${WHERE_CHAT_LOG(data.filter(col=> !pk.includes(col)))}`
export const DELETE_CHAT_LOG = ` UPDATE discord.CHAT_LOG SET use_yn = 'N'`

export interface CHAT_LOG {
    message_id: string;		/* KEY(PRI) char - * */
    user_id: string;		/* KEY(MUL) char - * */
    channel_id: string;		/* KEY(MUL) varchar - * */
    message: string| null;		/*  varchar - * */
    os_type: string| null;		/*  char - * */
    create_at: Date;		/*  timestamp - * */
    hidden_yn: string| null;		/*  char - * */
}