/* AUTO CREATE TABLE INTERFACE :: 1738571724592 */
/* error_logs */
type COLUMN = 'at_time' | 'message';
const columns : COLUMN[] = [ 'at_time','message' ];
const pk : COLUMN[] = [  ];

export const ERROR_LOGS = 'error_logs';
export const TABLE_COLUMNS_ERROR_LOGS = columns;
const WHERE_ERROR_LOGS = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_ERROR_LOGS = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.error_logs \nWHERE ${WHERE_ERROR_LOGS(where)}`
export const INSERT_ERROR_LOGS = (data: COLUMN[]) => ` INSERT INTO discord.ERROR_LOGS SET ${WHERE_ERROR_LOGS(data)} `
export const UPDATE_ERROR_LOGS = (data: COLUMN[]) => ` UPDATE discord.ERROR_LOGS SET ${WHERE_ERROR_LOGS(data.filter(col=> !pk.includes(col)))}`
export const DELETE_ERROR_LOGS = ` UPDATE discord.ERROR_LOGS SET use_yn = 'N'`

export interface ERROR_LOGS {
    at_time: Date| null;		/*  datetime - * */
    message: any| null;		/*  mediumtext - * */
}