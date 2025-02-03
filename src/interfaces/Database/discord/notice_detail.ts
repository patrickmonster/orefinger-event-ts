/* AUTO CREATE TABLE INTERFACE :: 1738571725576 */
/* 알림 - 상세 */
type COLUMN = 'notice_id' | 'message' | 'name' | 'img_idx' | 'update_at';
const columns : COLUMN[] = [ 'notice_id','message','name','img_idx','update_at' ];
const pk : COLUMN[] = [ 'notice_id' ];

export const NOTICE_DETAIL = 'notice_detail';
export const TABLE_COLUMNS_NOTICE_DETAIL = columns;
const WHERE_NOTICE_DETAIL = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_NOTICE_DETAIL = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.notice_detail \nWHERE ${WHERE_NOTICE_DETAIL(where)}`
export const INSERT_NOTICE_DETAIL = (data: COLUMN[]) => ` INSERT INTO discord.NOTICE_DETAIL SET ${WHERE_NOTICE_DETAIL(data)} `
export const UPDATE_NOTICE_DETAIL = (data: COLUMN[]) => ` UPDATE discord.NOTICE_DETAIL SET ${WHERE_NOTICE_DETAIL(data.filter(col=> !pk.includes(col)))}`
export const DELETE_NOTICE_DETAIL = ` UPDATE discord.NOTICE_DETAIL SET use_yn = 'N'`

export interface NOTICE_DETAIL {
    notice_id: number;		/* KEY(PRI) bigint - * */
    message: any| null;		/*  mediumtext - * */
    name: string| null;		/*  varchar - * */
    img_idx: number| null;		/* KEY(MUL) bigint - * */
    update_at: Date| null;		/*  timestamp - * */
}