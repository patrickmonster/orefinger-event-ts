/* AUTO CREATE TABLE INTERFACE :: 1738571725479 */
/* 사용자 생성 메세지 */
type COLUMN = 'message_id' | 'message' | 'embed_id' | 'create_at' | 'update_at' | 'create_user';
const columns : COLUMN[] = [ 'message_id','message','embed_id','create_at','update_at','create_user' ];
const pk : COLUMN[] = [ 'message_id' ];

export const MESSAGE_USER = 'message_user';
export const TABLE_COLUMNS_MESSAGE_USER = columns;
const WHERE_MESSAGE_USER = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_MESSAGE_USER = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.message_user \nWHERE ${WHERE_MESSAGE_USER(where)}`
export const INSERT_MESSAGE_USER = (data: COLUMN[]) => ` INSERT INTO discord.MESSAGE_USER SET ${WHERE_MESSAGE_USER(data)} `
export const UPDATE_MESSAGE_USER = (data: COLUMN[]) => ` UPDATE discord.MESSAGE_USER SET ${WHERE_MESSAGE_USER(data.filter(col=> !pk.includes(col)))}`
export const DELETE_MESSAGE_USER = ` UPDATE discord.MESSAGE_USER SET use_yn = 'N'`

export interface MESSAGE_USER {
    message_id: number;		/* KEY(PRI) bigint - * */
    message: any| null;		/*  mediumtext - * */
    embed_id: number| null;		/*  bigint - * */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
    create_user: string| null;		/* KEY(MUL) char - 인증테이블의 사용자 */
}