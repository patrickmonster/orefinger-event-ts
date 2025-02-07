/* AUTO CREATE TABLE INTERFACE :: 1738572455820 */
/* 가동서버 리스트 */
type COLUMN = 'idx' | 'host' | 'user' | 'create_at' | 'type' | 'keyfile';
const columns : COLUMN[] = [ 'idx','host','user','create_at','type','keyfile' ];
const pk : COLUMN[] = [ 'idx' ];

export const SERVER = 'server';
export const TABLE_COLUMNS_SERVER = columns;
const WHERE_SERVER = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_SERVER = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM sys_orefinger.server \nWHERE ${WHERE_SERVER(where)}`
export const INSERT_SERVER = (data: COLUMN[]) => ` INSERT INTO sys_orefinger.SERVER SET ${WHERE_SERVER(data)} `
export const UPDATE_SERVER = (data: COLUMN[]) => ` UPDATE sys_orefinger.SERVER SET ${WHERE_SERVER(data.filter(col=> !pk.includes(col)))}`
export const DELETE_SERVER = `UPDATE sys_orefinger.SERVER SET use_yn = 'N'`

export interface SERVER {
    idx: number;		/* KEY(PRI) bigint - * */
    host: string| null;		/*  char - * */
    user: string| null;		/*  char - * */
    create_at: Date;		/*  datetime - * */
    type: number| null;		/* KEY(MUL) int - * */
    keyfile: string| null;		/*  char - * */
}