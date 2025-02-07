/* AUTO CREATE TABLE INTERFACE :: 1738571726434 */
/* 이벤트 테이블 로그 - 인서트만 됨 */
type COLUMN = 'create_at' | 'target_table' | 'commant';
const columns : COLUMN[] = [ 'create_at','target_table','commant' ];
const pk : COLUMN[] = [  ];

export const TABLE_LOG = 'table_log';
export const TABLE_COLUMNS_TABLE_LOG = columns;
const WHERE_TABLE_LOG = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_TABLE_LOG = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.table_log \nWHERE ${WHERE_TABLE_LOG(where)}`
export const INSERT_TABLE_LOG = (data: COLUMN[]) => ` INSERT INTO discord.TABLE_LOG SET ${WHERE_TABLE_LOG(data)} `
export const UPDATE_TABLE_LOG = (data: COLUMN[]) => ` UPDATE discord.TABLE_LOG SET ${WHERE_TABLE_LOG(data.filter(col=> !pk.includes(col)))}`
export const DELETE_TABLE_LOG = ` UPDATE discord.TABLE_LOG SET use_yn = 'N'`

export interface TABLE_LOG {
    create_at: Date;		/* KEY(MUL) datetime - * */
    target_table: string| null;		/* KEY(MUL) varchar - * */
    commant: any| null;		/*  json - * */
}