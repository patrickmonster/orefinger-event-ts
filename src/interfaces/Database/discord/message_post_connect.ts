/* AUTO CREATE TABLE INTERFACE :: 1738571725450 */
/* 메세지 포스트 마스터 */
type COLUMN = 'post_id' | 'message_id' | 'create_user' | 'update_user' | 'create_at' | 'update_at' | 'use_yn' | 'order';
const columns : COLUMN[] = [ 'post_id','message_id','create_user','update_user','create_at','update_at','use_yn','order' ];
const pk : COLUMN[] = [ 'post_id','message_id' ];

export const MESSAGE_POST_CONNECT = 'message_post_connect';
export const TABLE_COLUMNS_MESSAGE_POST_CONNECT = columns;
const WHERE_MESSAGE_POST_CONNECT = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_MESSAGE_POST_CONNECT = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.message_post_connect \nWHERE ${WHERE_MESSAGE_POST_CONNECT(where)}`
export const INSERT_MESSAGE_POST_CONNECT = (data: COLUMN[]) => ` INSERT INTO discord.MESSAGE_POST_CONNECT SET ${WHERE_MESSAGE_POST_CONNECT(data)} `
export const UPDATE_MESSAGE_POST_CONNECT = (data: COLUMN[]) => ` UPDATE discord.MESSAGE_POST_CONNECT SET ${WHERE_MESSAGE_POST_CONNECT(data.filter(col=> !pk.includes(col)))}`
export const DELETE_MESSAGE_POST_CONNECT = ` DELETE FROM discord.MESSAGE_POST_CONNECT`

export interface MESSAGE_POST_CONNECT {
    post_id: number;		/* KEY(PRI) bigint - * */
    message_id: number;		/* KEY(PRI) bigint - * */
    create_user: string| null;		/*  char - 생성자 사용자 */
    update_user: string| null;		/*  char - 업데이트 사용자 */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
    use_yn: string;		/*  char - 사용 여부 */
    order: number;		/*  int - * */
}