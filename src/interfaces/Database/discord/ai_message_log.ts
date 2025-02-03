/* AUTO CREATE TABLE INTERFACE :: 1738571722661 */
/*  */
type COLUMN = 'user_id' | 'create_at' | 'message';
const columns : COLUMN[] = [ 'user_id','create_at','message' ];
const pk : COLUMN[] = [  ];

export const AI_MESSAGE_LOG = 'ai_message_log';
export const TABLE_COLUMNS_AI_MESSAGE_LOG = columns;
const WHERE_AI_MESSAGE_LOG = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_AI_MESSAGE_LOG = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.ai_message_log \nWHERE ${WHERE_AI_MESSAGE_LOG(where)}`
export const INSERT_AI_MESSAGE_LOG = (data: COLUMN[]) => ` INSERT INTO discord.AI_MESSAGE_LOG SET ${WHERE_AI_MESSAGE_LOG(data)} `
export const UPDATE_AI_MESSAGE_LOG = (data: COLUMN[]) => ` UPDATE discord.AI_MESSAGE_LOG SET ${WHERE_AI_MESSAGE_LOG(data.filter(col=> !pk.includes(col)))}`
export const DELETE_AI_MESSAGE_LOG = ` UPDATE discord.AI_MESSAGE_LOG SET use_yn = 'N'`

export interface AI_MESSAGE_LOG {
    user_id: string;		/* KEY(MUL) char - 고유 id\n */
    create_at: Date;		/*  timestamp - * */
    message: string;		/*  varchar - * */
}