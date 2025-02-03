/* AUTO CREATE TABLE INTERFACE :: 1738571725671 */
/* 라이브 상태변경 이력 - 상세 */
type COLUMN = 'notice_id' | 'hash_id' | 'create_at' | 'data';
const columns : COLUMN[] = [ 'notice_id','hash_id','create_at','data' ];
const pk : COLUMN[] = [ 'notice_id','hash_id' ];

export const NOTICE_HISTORY_DETAIL = 'notice_history_detail';
export const TABLE_COLUMNS_NOTICE_HISTORY_DETAIL = columns;
const WHERE_NOTICE_HISTORY_DETAIL = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_NOTICE_HISTORY_DETAIL = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.notice_history_detail \nWHERE ${WHERE_NOTICE_HISTORY_DETAIL(where)}`
export const INSERT_NOTICE_HISTORY_DETAIL = (data: COLUMN[]) => ` INSERT INTO discord.NOTICE_HISTORY_DETAIL SET ${WHERE_NOTICE_HISTORY_DETAIL(data)} `
export const UPDATE_NOTICE_HISTORY_DETAIL = (data: COLUMN[]) => ` UPDATE discord.NOTICE_HISTORY_DETAIL SET ${WHERE_NOTICE_HISTORY_DETAIL(data.filter(col=> !pk.includes(col)))}`
export const DELETE_NOTICE_HISTORY_DETAIL = ` UPDATE discord.NOTICE_HISTORY_DETAIL SET use_yn = 'N'`

export interface NOTICE_HISTORY_DETAIL {
    notice_id: number;		/* KEY(PRI) bigint - * */
    hash_id: string;		/* KEY(PRI) char - * */
    create_at: Date;		/*  timestamp - 변경시간 */
    data: string;		/*  text - * */
}