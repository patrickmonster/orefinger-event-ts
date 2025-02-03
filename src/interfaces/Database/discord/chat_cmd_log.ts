/* AUTO CREATE TABLE INTERFACE :: 1738571723580 */
/* 채팅 명령 이력 */
type COLUMN = 'message_id' | 'user_id' | 'message' | 'result' | 'create_at';
const columns : COLUMN[] = [ 'message_id','user_id','message','result','create_at' ];
const pk : COLUMN[] = [ 'message_id' ];

export const CHAT_CMD_LOG = 'chat_cmd_log';
export const TABLE_COLUMNS_CHAT_CMD_LOG = columns;
const WHERE_CHAT_CMD_LOG = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_CHAT_CMD_LOG = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.chat_cmd_log \nWHERE ${WHERE_CHAT_CMD_LOG(where)}`
export const INSERT_CHAT_CMD_LOG = (data: COLUMN[]) => ` INSERT INTO discord.CHAT_CMD_LOG SET ${WHERE_CHAT_CMD_LOG(data)} `
export const UPDATE_CHAT_CMD_LOG = (data: COLUMN[]) => ` UPDATE discord.CHAT_CMD_LOG SET ${WHERE_CHAT_CMD_LOG(data.filter(col=> !pk.includes(col)))}`
export const DELETE_CHAT_CMD_LOG = ` UPDATE discord.CHAT_CMD_LOG SET use_yn = 'N'`

export interface CHAT_CMD_LOG {
    message_id: string;		/* KEY(PRI) char - * */
    user_id: string;		/* KEY(MUL) char - * */
    message: string| null;		/*  varchar - * */
    result: string| null;		/*  varchar - * */
    create_at: Date;		/*  timestamp - * */
}