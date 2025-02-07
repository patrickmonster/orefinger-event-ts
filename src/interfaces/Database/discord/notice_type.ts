/* AUTO CREATE TABLE INTERFACE :: 1738571725753 */
/* 알림 타입 */
type COLUMN = 'notice_type_id' | 'tag' | 'use_yn' | 'video_yn' | 'auth_type' | 'scan_yn' | 'timmer' | 'loop_time' | 'lib';
const columns : COLUMN[] = [ 'notice_type_id','tag','use_yn','video_yn','auth_type','scan_yn','timmer','loop_time','lib' ];
const pk : COLUMN[] = [ 'notice_type_id' ];

export const NOTICE_TYPE = 'notice_type';
export const TABLE_COLUMNS_NOTICE_TYPE = columns;
const WHERE_NOTICE_TYPE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_NOTICE_TYPE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.notice_type \nWHERE ${WHERE_NOTICE_TYPE(where)}`
export const INSERT_NOTICE_TYPE = (data: COLUMN[]) => ` INSERT INTO discord.NOTICE_TYPE SET ${WHERE_NOTICE_TYPE(data)} `
export const UPDATE_NOTICE_TYPE = (data: COLUMN[]) => ` UPDATE discord.NOTICE_TYPE SET ${WHERE_NOTICE_TYPE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_NOTICE_TYPE = ` DELETE FROM discord.NOTICE_TYPE`

export interface NOTICE_TYPE {
    notice_type_id: number;		/* KEY(PRI) bigint - * */
    tag: string| null;		/*  varchar - * */
    use_yn: string;		/*  char - 사용자 개별 설정 */
    video_yn: string| null;		/*  char - 정적 리스트 여부 */
    auth_type: number| null;		/*  int - * */
    scan_yn: string;		/*  char - 스캐너 여부 */
    timmer: number;		/*  int - 개별 */
    loop_time: number;		/*  int - 타이머 */
    lib: string;		/*  varchar - 라이브러리 */
}