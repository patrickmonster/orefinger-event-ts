/* AUTO CREATE TABLE INTERFACE :: 1738571725131 */
/* 링크 카운터 테이블 (히스토리) - 이력 */
type COLUMN = 'idx' | 'id' | 'create_at' | 'update_at' | 'user_status';
const columns : COLUMN[] = [ 'idx','id','create_at','update_at','user_status' ];
const pk : COLUMN[] = [ 'idx' ];

export const LINK_TARGET_HISTORY = 'link_target_history';
export const TABLE_COLUMNS_LINK_TARGET_HISTORY = columns;
const WHERE_LINK_TARGET_HISTORY = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_LINK_TARGET_HISTORY = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.link_target_history \nWHERE ${WHERE_LINK_TARGET_HISTORY(where)}`
export const INSERT_LINK_TARGET_HISTORY = (data: COLUMN[]) => ` INSERT INTO discord.LINK_TARGET_HISTORY SET ${WHERE_LINK_TARGET_HISTORY(data)} `
export const UPDATE_LINK_TARGET_HISTORY = (data: COLUMN[]) => ` UPDATE discord.LINK_TARGET_HISTORY SET ${WHERE_LINK_TARGET_HISTORY(data.filter(col=> !pk.includes(col)))}`
export const DELETE_LINK_TARGET_HISTORY = ` UPDATE discord.LINK_TARGET_HISTORY SET use_yn = 'N'`

export interface LINK_TARGET_HISTORY {
    idx: number;		/* KEY(PRI) bigint - * */
    id: number;		/* KEY(MUL) bigint - * */
    create_at: Date;		/*  timestamp - * */
    update_at: Date;		/*  timestamp - * */
    user_status: any| null;		/*  json - * */
}