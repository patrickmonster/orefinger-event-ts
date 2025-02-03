/* AUTO CREATE TABLE INTERFACE :: 1738571726305 */
/* 질의응답 타입 */
type COLUMN = 'qna_type' | 'create_at' | 'use_yn' | 'name' | 'description' | 'writer_yn' | 'reader_yn' | 'user_yn';
const columns : COLUMN[] = [ 'qna_type','create_at','use_yn','name','description','writer_yn','reader_yn','user_yn' ];
const pk : COLUMN[] = [ 'qna_type' ];

export const QNA_TYPE = 'qna_type';
export const TABLE_COLUMNS_QNA_TYPE = columns;
const WHERE_QNA_TYPE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_QNA_TYPE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.qna_type \nWHERE ${WHERE_QNA_TYPE(where)}`
export const INSERT_QNA_TYPE = (data: COLUMN[]) => ` INSERT INTO discord.QNA_TYPE SET ${WHERE_QNA_TYPE(data)} `
export const UPDATE_QNA_TYPE = (data: COLUMN[]) => ` UPDATE discord.QNA_TYPE SET ${WHERE_QNA_TYPE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_QNA_TYPE = ` DELETE FROM discord.QNA_TYPE`

export interface QNA_TYPE {
    qna_type: number;		/* KEY(PRI) int - * */
    create_at: Date;		/*  timestamp - * */
    use_yn: string;		/*  varchar - 사용유무 */
    name: string| null;		/*  varchar - * */
    description: string| null;		/*  varchar - * */
    writer_yn: string;		/*  varchar - 작성글 출력 유무 */
    reader_yn: string;		/*  varchar - 답변 출력 유무 */
    user_yn: string;		/*  varchar - 작성자 노출 유무 */
}