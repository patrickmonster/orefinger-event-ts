/* AUTO CREATE TABLE INTERFACE :: 1738571726377 */
/* 메세지 전송 이력 */
type COLUMN = 'id' | 'idx' | 'channel_id' | 'channel_id' | 'webhook_id' | 'guild_id' | 'result_message' | 'message' | 'message_at' | 'send_yn';
const columns : COLUMN[] = [ 'id','idx','channel_id','channel_id','webhook_id','guild_id','result_message','message','message_at','send_yn' ];
const pk : COLUMN[] = [ 'idx' ];

export const SEND_MESSAGE = 'send_message';
export const TABLE_COLUMNS_SEND_MESSAGE = columns;
const WHERE_SEND_MESSAGE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_SEND_MESSAGE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.send_message \nWHERE ${WHERE_SEND_MESSAGE(where)}`
export const INSERT_SEND_MESSAGE = (data: COLUMN[]) => ` INSERT INTO discord.SEND_MESSAGE SET ${WHERE_SEND_MESSAGE(data)} `
export const UPDATE_SEND_MESSAGE = (data: COLUMN[]) => ` UPDATE discord.SEND_MESSAGE SET ${WHERE_SEND_MESSAGE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_SEND_MESSAGE = ` UPDATE discord.SEND_MESSAGE SET use_yn = 'N'`

export interface SEND_MESSAGE {
    id: string;		/*  varchar - * */
    idx: number;		/* KEY(PRI) bigint - * */
    channel_id: string;		/* KEY(MUL) varchar - * */
    webhook_id: string| null;		/*  varchar - * */
    guild_id: string| null;		/* KEY(MUL) varchar - * */
    result_message: any| null;		/*  json - * */
    message: any| null;		/*  mediumtext - * */
    message_at: Date| null;		/*  datetime - * */
    send_yn: string| null;		/*  char - * */
}