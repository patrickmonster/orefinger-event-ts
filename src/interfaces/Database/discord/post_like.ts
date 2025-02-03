/* AUTO CREATE TABLE INTERFACE :: 1738571726125 */
/* 포스트 상태 */
type COLUMN = 'id' | 'id' | 'auth_id' | 'auth_id' | 'like_yn' | 'like_yn' | 'bookmark_yn' | 'bookmark_yn' | 'delete_yn' | 'delete_yn' | 'time_at' | 'time_at';
const columns : COLUMN[] = [ 'id','id','auth_id','auth_id','like_yn','like_yn','bookmark_yn','bookmark_yn','delete_yn','delete_yn','time_at','time_at' ];
const pk : COLUMN[] = [ 'id','id','auth_id','auth_id' ];

export const POST_LIKE = 'post_like';
export const TABLE_COLUMNS_POST_LIKE = columns;
const WHERE_POST_LIKE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_POST_LIKE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.post_like \nWHERE ${WHERE_POST_LIKE(where)}`
export const INSERT_POST_LIKE = (data: COLUMN[]) => ` INSERT INTO discord.POST_LIKE SET ${WHERE_POST_LIKE(data)} `
export const UPDATE_POST_LIKE = (data: COLUMN[]) => ` UPDATE discord.POST_LIKE SET ${WHERE_POST_LIKE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_POST_LIKE = ` UPDATE discord.POST_LIKE SET use_yn = 'N'`

export interface POST_LIKE {
    id: number;		/* KEY(PRI) bigint - * */
    auth_id: string;		/* KEY(PRI) char - * */
    like_yn: string| null;		/*  varchar - * */
    bookmark_yn: string| null;		/*  char - * */
    delete_yn: string| null;		/*  char - * */
    time_at: Date| null;		/*  timestamp - * */
}