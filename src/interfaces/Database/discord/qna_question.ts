/* AUTO CREATE TABLE INTERFACE :: 1738571726265 */
/* 질문 메세지 */
type COLUMN = 'idx' | 'auth_id' | 'title' | 'description' | 'create_at' | 'use_yn' | 'answer' | 'update_at' | 'answer_id';
const columns : COLUMN[] = [ 'idx','auth_id','title','description','create_at','use_yn','answer','update_at','answer_id' ];
const pk : COLUMN[] = [ 'idx' ];

export const QNA_QUESTION = 'qna_question';
export const TABLE_COLUMNS_QNA_QUESTION = columns;
const WHERE_QNA_QUESTION = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_QNA_QUESTION = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.qna_question \nWHERE ${WHERE_QNA_QUESTION(where)}`
export const INSERT_QNA_QUESTION = (data: COLUMN[]) => ` INSERT INTO discord.QNA_QUESTION SET ${WHERE_QNA_QUESTION(data)} `
export const UPDATE_QNA_QUESTION = (data: COLUMN[]) => ` UPDATE discord.QNA_QUESTION SET ${WHERE_QNA_QUESTION(data.filter(col=> !pk.includes(col)))}`
export const DELETE_QNA_QUESTION = ` DELETE FROM discord.QNA_QUESTION`

export interface QNA_QUESTION {
    idx: number;		/* KEY(PRI) bigint - * */
    auth_id: string;		/*  char - * */
    title: string| null;		/*  varchar - * */
    description: string| null;		/*  text - * */
    create_at: Date| null;		/*  timestamp - * */
    use_yn: string| null;		/*  varchar - * */
    answer: string| null;		/*  text - * */
    update_at: Date| null;		/*  timestamp - * */
    answer_id: string;		/*  char - * */
}