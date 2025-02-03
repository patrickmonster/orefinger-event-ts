/* AUTO CREATE TABLE INTERFACE :: 1738571726408 */
/* 상태 테이블 */
type COLUMN = 'idx' | 'tag' | 'code_1' | 'code_2' | 'code_3' | 'code_4' | 'code_5';
const columns : COLUMN[] = [ 'idx','tag','code_1','code_2','code_3','code_4','code_5' ];
const pk : COLUMN[] = [ 'idx' ];

export const STATE = 'state';
export const TABLE_COLUMNS_STATE = columns;
const WHERE_STATE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_STATE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.state \nWHERE ${WHERE_STATE(where)}`
export const INSERT_STATE = (data: COLUMN[]) => ` INSERT INTO discord.STATE SET ${WHERE_STATE(data)} `
export const UPDATE_STATE = (data: COLUMN[]) => ` UPDATE discord.STATE SET ${WHERE_STATE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_STATE = ` UPDATE discord.STATE SET use_yn = 'N'`

export interface STATE {
    idx: number;		/* KEY(PRI) bigint - pk */
    tag: string| null;		/*  varchar - * */
    code_1: string| null;		/*  char - * */
    code_2: string| null;		/*  char - * */
    code_3: string| null;		/*  char - * */
    code_4: string| null;		/*  char - * */
    code_5: string| null;		/*  char - * */
}