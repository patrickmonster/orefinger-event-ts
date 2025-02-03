/* AUTO CREATE TABLE INTERFACE :: 1738572455845 */
/* 서버 운용타입 */
type COLUMN = 'type_idx' | 'name';
const columns : COLUMN[] = [ 'type_idx','name' ];
const pk : COLUMN[] = [ 'type_idx' ];

export const SERVER_TYPE = 'server_type';
export const TABLE_COLUMNS_SERVER_TYPE = columns;
const WHERE_SERVER_TYPE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_SERVER_TYPE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM sys_orefinger.server_type \nWHERE ${WHERE_SERVER_TYPE(where)}`
export const INSERT_SERVER_TYPE = (data: COLUMN[]) => ` INSERT INTO sys_orefinger.SERVER_TYPE SET ${WHERE_SERVER_TYPE(data)} `
export const UPDATE_SERVER_TYPE = (data: COLUMN[]) => ` UPDATE sys_orefinger.SERVER_TYPE SET ${WHERE_SERVER_TYPE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_SERVER_TYPE = `UPDATE sys_orefinger.SERVER_TYPE SET use_yn = 'N'`

export interface SERVER_TYPE {
    type_idx: number;		/* KEY(PRI) int - * */
    name: string| null;		/*  char - * */
}