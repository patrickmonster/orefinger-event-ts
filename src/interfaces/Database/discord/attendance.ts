/* AUTO CREATE TABLE INTERFACE :: 1738571722687 */
/* ALTER TABLE attendance ADD PARTITION (
	PARTITION p2410 VALUES LESS THAN (2410),
	PARTITION p2411 VALUES LESS THAN (2411),
	PARTITION p2412 VALUES LESS THAN (2412)
) */
type COLUMN = 'type' | 'yymm' | 'attendance_time' | 'auth_id' | 'event_id';
const columns : COLUMN[] = [ 'type','yymm','attendance_time','auth_id','event_id' ];
const pk : COLUMN[] = [ 'yymm','auth_id','event_id' ];

export const ATTENDANCE = 'attendance';
export const TABLE_COLUMNS_ATTENDANCE = columns;
const WHERE_ATTENDANCE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_ATTENDANCE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.attendance \nWHERE ${WHERE_ATTENDANCE(where)}`
export const INSERT_ATTENDANCE = (data: COLUMN[]) => ` INSERT INTO discord.ATTENDANCE SET ${WHERE_ATTENDANCE(data)} `
export const UPDATE_ATTENDANCE = (data: COLUMN[]) => ` UPDATE discord.ATTENDANCE SET ${WHERE_ATTENDANCE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_ATTENDANCE = ` UPDATE discord.ATTENDANCE SET use_yn = 'N'`

export interface ATTENDANCE {
    type: number| null;		/* KEY(MUL) int - 이벤트 타입 */
    yymm: number;		/* KEY(PRI) int - * */
    attendance_time: Date;		/*  datetime - * */
    auth_id: string;		/* KEY(PRI) varchar - * */
    event_id: string;		/* KEY(PRI) varchar - * */
}