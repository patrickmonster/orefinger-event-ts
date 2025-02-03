/* AUTO CREATE TABLE INTERFACE :: 1738571722726 */
/*  */
type COLUMN = 'total' | 'cnt' | 'yymm' | 'avg_late_time_kr' | 'avg_running_time_kr' | 'avg_late_time' | 'avg_running_time' | 'per' | 'stream_id' | 'auth_id';
const columns : COLUMN[] = [ 'total','cnt','yymm','avg_late_time_kr','avg_running_time_kr','avg_late_time','avg_running_time','per','stream_id','auth_id' ];
const pk : COLUMN[] = [ 'yymm','stream_id','auth_id' ];

export const ATTENDANCE_RANK = 'attendance_rank';
export const TABLE_COLUMNS_ATTENDANCE_RANK = columns;
const WHERE_ATTENDANCE_RANK = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_ATTENDANCE_RANK = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.attendance_rank \nWHERE ${WHERE_ATTENDANCE_RANK(where)}`
export const INSERT_ATTENDANCE_RANK = (data: COLUMN[]) => ` INSERT INTO discord.ATTENDANCE_RANK SET ${WHERE_ATTENDANCE_RANK(data)} `
export const UPDATE_ATTENDANCE_RANK = (data: COLUMN[]) => ` UPDATE discord.ATTENDANCE_RANK SET ${WHERE_ATTENDANCE_RANK(data.filter(col=> !pk.includes(col)))}`
export const DELETE_ATTENDANCE_RANK = ` UPDATE discord.ATTENDANCE_RANK SET use_yn = 'N'`

export interface ATTENDANCE_RANK {
    total: number| null;		/*  bigint - 출석 가능수 */
    cnt: number| null;		/*  bigint - 횟수 */
    yymm: string;		/* KEY(PRI) varchar - 월자 */
    avg_late_time_kr: string| null;		/*  varchar - * */
    avg_running_time_kr: string| null;		/*  varchar - * */
    avg_late_time: number| null;		/*  int - * */
    avg_running_time: number| null;		/*  int - * */
    per: any| null;		/*  decimal - 출석율(퍼센트) */
    stream_id: string;		/* KEY(PRI) char - * */
    auth_id: string;		/* KEY(PRI) varchar - * */
}