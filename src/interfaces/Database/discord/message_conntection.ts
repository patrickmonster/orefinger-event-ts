/* AUTO CREATE TABLE INTERFACE :: 1738571725230 */
/* 메세지 콘텐츠 */
type COLUMN = 'message_id' | 'embed_id' | 'component_col_id' | 'create_at';
const columns : COLUMN[] = [ 'message_id','embed_id','component_col_id','create_at' ];
const pk : COLUMN[] = [ 'message_id' ];

export const MESSAGE_CONNTECTION = 'message_conntection';
export const TABLE_COLUMNS_MESSAGE_CONNTECTION = columns;
const WHERE_MESSAGE_CONNTECTION = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_MESSAGE_CONNTECTION = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.message_conntection \nWHERE ${WHERE_MESSAGE_CONNTECTION(where)}`
export const INSERT_MESSAGE_CONNTECTION = (data: COLUMN[]) => ` INSERT INTO discord.MESSAGE_CONNTECTION SET ${WHERE_MESSAGE_CONNTECTION(data)} `
export const UPDATE_MESSAGE_CONNTECTION = (data: COLUMN[]) => ` UPDATE discord.MESSAGE_CONNTECTION SET ${WHERE_MESSAGE_CONNTECTION(data.filter(col=> !pk.includes(col)))}`
export const DELETE_MESSAGE_CONNTECTION = ` UPDATE discord.MESSAGE_CONNTECTION SET use_yn = 'N'`

export interface MESSAGE_CONNTECTION {
    message_id: number;		/* KEY(PRI) bigint - * */
    embed_id: number| null;		/* KEY(MUL) bigint - * */
    component_col_id: number| null;		/* KEY(MUL) bigint - * */
    create_at: Date;		/*  timestamp - * */
}