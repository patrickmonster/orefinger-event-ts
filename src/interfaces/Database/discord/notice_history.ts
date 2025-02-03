/* AUTO CREATE TABLE INTERFACE :: 1738571725642 */
/* 라이브 상태변경 이력 */
type COLUMN = 'notice_id' | 'hash_id' | 'create_at' | 'data';
const columns : COLUMN[] = [ 'notice_id','hash_id','create_at','data' ];
const pk : COLUMN[] = [ 'notice_id','hash_id' ];

export const NOTICE_HISTORY = 'notice_history';
export const TABLE_COLUMNS_NOTICE_HISTORY = columns;
const WHERE_NOTICE_HISTORY = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_NOTICE_HISTORY = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.notice_history \nWHERE ${WHERE_NOTICE_HISTORY(where)}`
export const INSERT_NOTICE_HISTORY = (data: COLUMN[]) => ` INSERT INTO discord.NOTICE_HISTORY SET ${WHERE_NOTICE_HISTORY(data)} `
export const UPDATE_NOTICE_HISTORY = (data: COLUMN[]) => ` UPDATE discord.NOTICE_HISTORY SET ${WHERE_NOTICE_HISTORY(data.filter(col=> !pk.includes(col)))}`
export const DELETE_NOTICE_HISTORY = ` UPDATE discord.NOTICE_HISTORY SET use_yn = 'N'`

export interface NOTICE_HISTORY {
    notice_id: number;		/* KEY(PRI) bigint - * */
    hash_id: string;		/* KEY(PRI) char - * */
    create_at: Date;		/*  timestamp - 변경시간 */
    data: any;		/*  json - * */
}