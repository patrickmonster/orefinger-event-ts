/* AUTO CREATE TABLE INTERFACE :: 1738571725272 */
/* 컴포넌트 연결 종류 */
type COLUMN = 'message_content_type_idx' | 'tag' | 'create_at';
const columns : COLUMN[] = [ 'message_content_type_idx','tag','create_at' ];
const pk : COLUMN[] = [ 'message_content_type_idx' ];

export const MESSAGE_CONTENT_TYPE = 'message_content_type';
export const TABLE_COLUMNS_MESSAGE_CONTENT_TYPE = columns;
const WHERE_MESSAGE_CONTENT_TYPE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_MESSAGE_CONTENT_TYPE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.message_content_type \nWHERE ${WHERE_MESSAGE_CONTENT_TYPE(where)}`
export const INSERT_MESSAGE_CONTENT_TYPE = (data: COLUMN[]) => ` INSERT INTO discord.MESSAGE_CONTENT_TYPE SET ${WHERE_MESSAGE_CONTENT_TYPE(data)} `
export const UPDATE_MESSAGE_CONTENT_TYPE = (data: COLUMN[]) => ` UPDATE discord.MESSAGE_CONTENT_TYPE SET ${WHERE_MESSAGE_CONTENT_TYPE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_MESSAGE_CONTENT_TYPE = ` UPDATE discord.MESSAGE_CONTENT_TYPE SET use_yn = 'N'`

export interface MESSAGE_CONTENT_TYPE {
    message_content_type_idx: number;		/* KEY(PRI) bigint - * */
    tag: string| null;		/*  varchar - * */
    create_at: Date;		/*  timestamp - * */
}