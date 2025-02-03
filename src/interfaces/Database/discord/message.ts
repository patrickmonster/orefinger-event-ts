/* AUTO CREATE TABLE INTERFACE :: 1738571725198 */
/* 메세지 컴포넌트 */
type COLUMN = 'message_id' | 'message_id' | 'content_id' | 'context_id' | 'name' | 'tag' | 'create_at' | 'tts_yn' | 'update_at' | 'ephemeral_yn' | 'tag' | 'create_at' | 'ephemeral_yn' | 'update_at';
const columns : COLUMN[] = [ 'message_id','message_id','content_id','context_id','name','tag','create_at','tts_yn','update_at','ephemeral_yn','tag','create_at','ephemeral_yn','update_at' ];
const pk : COLUMN[] = [ 'message_id','message_id' ];

export const MESSAGE = 'message';
export const TABLE_COLUMNS_MESSAGE = columns;
const WHERE_MESSAGE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_MESSAGE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.message \nWHERE ${WHERE_MESSAGE(where)}`
export const INSERT_MESSAGE = (data: COLUMN[]) => ` INSERT INTO discord.MESSAGE SET ${WHERE_MESSAGE(data)} `
export const UPDATE_MESSAGE = (data: COLUMN[]) => ` UPDATE discord.MESSAGE SET ${WHERE_MESSAGE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_MESSAGE = ` UPDATE discord.MESSAGE SET use_yn = 'N'`

export interface MESSAGE {
    message_id: number;		/* KEY(PRI) bigint - * */
    content_id: number| null;		/* KEY(MUL) bigint - * */
    context_id: number;		/* KEY(MUL) bigint - 인식값 */
    name: string| null;		/*  varchar - * */
    tag: string| null;		/*  varchar - * */
    create_at: Date;		/*  timestamp - * */
    tts_yn: string| null;		/*  char - * */
    update_at: Date;		/*  timestamp - * */
    ephemeral_yn: string| null;		/*  char - * */
}