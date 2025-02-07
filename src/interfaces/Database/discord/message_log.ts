/* AUTO CREATE TABLE INTERFACE :: 1738571725318 */
/* 메세지 전송 이력 */
type COLUMN = 'message_id' | 'channel_id' | 'message' | 'create_at';
const columns : COLUMN[] = [ 'message_id','channel_id','message','create_at' ];
const pk : COLUMN[] = [ 'message_id' ];

export const MESSAGE_LOG = 'message_log';
export const TABLE_COLUMNS_MESSAGE_LOG = columns;
const WHERE_MESSAGE_LOG = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_MESSAGE_LOG = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.message_log \nWHERE ${WHERE_MESSAGE_LOG(where)}`
export const INSERT_MESSAGE_LOG = (data: COLUMN[]) => ` INSERT INTO discord.MESSAGE_LOG SET ${WHERE_MESSAGE_LOG(data)} `
export const UPDATE_MESSAGE_LOG = (data: COLUMN[]) => ` UPDATE discord.MESSAGE_LOG SET ${WHERE_MESSAGE_LOG(data.filter(col=> !pk.includes(col)))}`
export const DELETE_MESSAGE_LOG = ` UPDATE discord.MESSAGE_LOG SET use_yn = 'N'`

export interface MESSAGE_LOG {
    message_id: string;		/* KEY(PRI) char - * */
    channel_id: string;		/* KEY(MUL) char - * */
    message: any;		/*  json - * */
    create_at: Date;		/*  timestamp - * */
}