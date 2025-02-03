/* AUTO CREATE TABLE INTERFACE :: 1738571726497 */
/* 물리적으로 분리된 서버 */
type COLUMN = 'server_id' | 'create_at' | 'update_at';
const columns : COLUMN[] = [ 'server_id','create_at','update_at' ];
const pk : COLUMN[] = [ 'server_id' ];

export const TASK_2 = 'task2';
export const TABLE_COLUMNS_TASK_2 = columns;
const WHERE_TASK_2 = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_TASK_2 = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.task2 \nWHERE ${WHERE_TASK_2(where)}`
export const INSERT_TASK_2 = (data: COLUMN[]) => ` INSERT INTO discord.TASK_2 SET ${WHERE_TASK_2(data)} `
export const UPDATE_TASK_2 = (data: COLUMN[]) => ` UPDATE discord.TASK_2 SET ${WHERE_TASK_2(data.filter(col=> !pk.includes(col)))}`
export const DELETE_TASK_2 = ` UPDATE discord.TASK_2 SET use_yn = 'N'`

export interface TASK_2 {
    server_id: string;		/* KEY(PRI) char - * */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
}