/* AUTO CREATE TABLE INTERFACE :: 1738571724758 */
/* 라이브 진행중인... */
type COLUMN = 'auth_id' | 'event_id' | 'type' | 'create_at';
const columns : COLUMN[] = [ 'auth_id','event_id','type','create_at' ];
const pk : COLUMN[] = [  ];

export const EVENT_LIVE = 'event_live';
export const TABLE_COLUMNS_EVENT_LIVE = columns;
const WHERE_EVENT_LIVE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_EVENT_LIVE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.event_live \nWHERE ${WHERE_EVENT_LIVE(where)}`
export const INSERT_EVENT_LIVE = (data: COLUMN[]) => ` INSERT INTO discord.EVENT_LIVE SET ${WHERE_EVENT_LIVE(data)} `
export const UPDATE_EVENT_LIVE = (data: COLUMN[]) => ` UPDATE discord.EVENT_LIVE SET ${WHERE_EVENT_LIVE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_EVENT_LIVE = ` UPDATE discord.EVENT_LIVE SET use_yn = 'N'`

export interface EVENT_LIVE {
    auth_id: string| null;		/* KEY(MUL) char - * */
    event_id: string| null;		/*  varchar - * */
    type: number;		/* KEY(MUL) int - 이벤트 타입 */
    create_at: Date| null;		/*  datetime - * */
}