/* AUTO CREATE TABLE INTERFACE :: 1738571725509 */
/* 알림 테이블
- 알림을 모니터링 합니다 */
type COLUMN = 'notice_id' | 'hash_id' | 'notice_type' | 'create_at' | 'update_at' | 'use_yn';
const columns : COLUMN[] = [ 'notice_id','hash_id','notice_type','create_at','update_at','use_yn' ];
const pk : COLUMN[] = [ 'notice_id' ];

export const NOTICE = 'notice';
export const TABLE_COLUMNS_NOTICE = columns;
const WHERE_NOTICE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_NOTICE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.notice \nWHERE ${WHERE_NOTICE(where)}`
export const INSERT_NOTICE = (data: COLUMN[]) => ` INSERT INTO discord.NOTICE SET ${WHERE_NOTICE(data)} `
export const UPDATE_NOTICE = (data: COLUMN[]) => ` UPDATE discord.NOTICE SET ${WHERE_NOTICE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_NOTICE = ` DELETE FROM discord.NOTICE`

export interface NOTICE {
    notice_id: number;		/* KEY(PRI) bigint - * */
    hash_id: string;		/* KEY(MUL) varchar - * */
    notice_type: number;		/* KEY(MUL) bigint - * */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
    use_yn: string;		/*  varchar - 사용자 개별 설정 */
}