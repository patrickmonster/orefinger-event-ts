/* AUTO CREATE TABLE INTERFACE :: 1738571726222 */
/* 질의 응답 */
type COLUMN = 'guild_id' | 'type' | 'embed_id' | 'last_message' | 'use_yn' | 'create_at' | 'update_at' | 'button';
const columns : COLUMN[] = [ 'guild_id','type','embed_id','last_message','use_yn','create_at','update_at','button' ];
const pk : COLUMN[] = [ 'guild_id','type' ];

export const QNA = 'qna';
export const TABLE_COLUMNS_QNA = columns;
const WHERE_QNA = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_QNA = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.qna \nWHERE ${WHERE_QNA(where)}`
export const INSERT_QNA = (data: COLUMN[]) => ` INSERT INTO discord.QNA SET ${WHERE_QNA(data)} `
export const UPDATE_QNA = (data: COLUMN[]) => ` UPDATE discord.QNA SET ${WHERE_QNA(data.filter(col=> !pk.includes(col)))}`
export const DELETE_QNA = ` DELETE FROM discord.QNA`

export interface QNA {
    guild_id: string;		/* KEY(PRI) varchar - 고유 id
 */
    type: number;		/* KEY(PRI) int - 이벤트 타입 */
    embed_id: number| null;		/*  bigint - * */
    last_message: string| null;		/*  varchar - 이벤트 타입 */
    use_yn: string;		/*  varchar - 사용유무 */
    create_at: Date;		/*  timestamp - * */
    update_at: Date;		/*  timestamp - * */
    button: string| null;		/*  varchar - 출력버튼 */
}