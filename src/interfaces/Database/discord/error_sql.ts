/* AUTO CREATE TABLE INTERFACE :: 1738571724617 */
/* 쿼리 오류 기록 테이블 */
type COLUMN = 'at_time' | 'at_time' | 'sql' | 'sql' | 'target' | 'target';
const columns : COLUMN[] = [ 'at_time','at_time','sql','sql','target','target' ];
const pk : COLUMN[] = [  ];

export const ERROR_SQL = 'error_sql';
export const TABLE_COLUMNS_ERROR_SQL = columns;
const WHERE_ERROR_SQL = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_ERROR_SQL = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.error_sql \nWHERE ${WHERE_ERROR_SQL(where)}`
export const INSERT_ERROR_SQL = (data: COLUMN[]) => ` INSERT INTO discord.ERROR_SQL SET ${WHERE_ERROR_SQL(data)} `
export const UPDATE_ERROR_SQL = (data: COLUMN[]) => ` UPDATE discord.ERROR_SQL SET ${WHERE_ERROR_SQL(data.filter(col=> !pk.includes(col)))}`
export const DELETE_ERROR_SQL = ` UPDATE discord.ERROR_SQL SET use_yn = 'N'`

export interface ERROR_SQL {
    at_time: Date| null;		/* KEY(MUL) datetime - * */
    sql: any| null;		/*  mediumtext - * */
    target: string| null;		/* KEY(MUL) varchar - * */
}