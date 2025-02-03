/* AUTO CREATE TABLE INTERFACE :: 1738571725393 */
/* 메세지 포스트 마스터 */
type COLUMN = 'post_id' | 'tag' | 'create_user' | 'update_user' | 'create_at' | 'update_at';
const columns : COLUMN[] = [ 'post_id','tag','create_user','update_user','create_at','update_at' ];
const pk : COLUMN[] = [ 'post_id' ];

export const MESSAGE_POST = 'message_post';
export const TABLE_COLUMNS_MESSAGE_POST = columns;
const WHERE_MESSAGE_POST = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_MESSAGE_POST = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.message_post \nWHERE ${WHERE_MESSAGE_POST(where)}`
export const INSERT_MESSAGE_POST = (data: COLUMN[]) => ` INSERT INTO discord.MESSAGE_POST SET ${WHERE_MESSAGE_POST(data)} `
export const UPDATE_MESSAGE_POST = (data: COLUMN[]) => ` UPDATE discord.MESSAGE_POST SET ${WHERE_MESSAGE_POST(data.filter(col=> !pk.includes(col)))}`
export const DELETE_MESSAGE_POST = ` UPDATE discord.MESSAGE_POST SET use_yn = 'N'`

export interface MESSAGE_POST {
    post_id: number;		/* KEY(PRI) bigint - * */
    tag: string| null;		/*  varchar - 코맨트 */
    create_user: string| null;		/*  char - 인증테이블의 사용자 */
    update_user: string| null;		/*  char - 인증테이블의 사용자 */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
}