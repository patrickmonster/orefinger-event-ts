/* AUTO CREATE TABLE INTERFACE :: 1738571724703 */
/* 이벤트 관리자
idx in (14,15,16,17,18,19,20,23,52) */
type COLUMN = 'type' | 'user_id' | 'token' | 'data' | 'use_yn' | 'create_at' | 'update_at';
const columns : COLUMN[] = [ 'type','user_id','token','data','use_yn','create_at','update_at' ];
const pk : COLUMN[] = [ 'type','user_id' ];

export const EVENT_ID = 'event_id';
export const TABLE_COLUMNS_EVENT_ID = columns;
const WHERE_EVENT_ID = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_EVENT_ID = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.event_id \nWHERE ${WHERE_EVENT_ID(where)}`
export const INSERT_EVENT_ID = (data: COLUMN[]) => ` INSERT INTO discord.EVENT_ID SET ${WHERE_EVENT_ID(data)} `
export const UPDATE_EVENT_ID = (data: COLUMN[]) => ` UPDATE discord.EVENT_ID SET ${WHERE_EVENT_ID(data.filter(col=> !pk.includes(col)))}`
export const DELETE_EVENT_ID = ` DELETE FROM discord.EVENT_ID`

export interface EVENT_ID {
    type: number;		/* KEY(PRI) int - 이벤트 타입 */
    user_id: string;		/* KEY(PRI) varchar - 고유 id
 */
    token: string| null;		/* KEY(MUL) varchar - 이벤트 ID
 */
    data: any;		/*  json - * */
    use_yn: string| null;		/*  varchar - 사용유무 */
    create_at: Date;		/*  timestamp - * */
    update_at: Date;		/*  timestamp - * */
}