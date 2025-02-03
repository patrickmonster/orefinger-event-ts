/* AUTO CREATE TABLE INTERFACE :: 1738571724816 */
/* 온라인 이벤트 */
type COLUMN = 'event_id' | 'type' | 'auth_id' | 'title' | 'game_id' | 'game_name' | 'create_at' | 'end_at';
const columns : COLUMN[] = [ 'event_id','type','auth_id','title','game_id','game_name','create_at','end_at' ];
const pk : COLUMN[] = [ 'event_id','type' ];

export const EVENT_ONLINE = 'event_online';
export const TABLE_COLUMNS_EVENT_ONLINE = columns;
const WHERE_EVENT_ONLINE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_EVENT_ONLINE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.event_online \nWHERE ${WHERE_EVENT_ONLINE(where)}`
export const INSERT_EVENT_ONLINE = (data: COLUMN[]) => ` INSERT INTO discord.EVENT_ONLINE SET ${WHERE_EVENT_ONLINE(data)} `
export const UPDATE_EVENT_ONLINE = (data: COLUMN[]) => ` UPDATE discord.EVENT_ONLINE SET ${WHERE_EVENT_ONLINE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_EVENT_ONLINE = ` UPDATE discord.EVENT_ONLINE SET use_yn = 'N'`

export interface EVENT_ONLINE {
    event_id: string;		/* KEY(PRI) varchar - * */
    type: number;		/* KEY(PRI) int - 이벤트 타입 */
    auth_id: string| null;		/* KEY(MUL) char - * */
    title: string| null;		/*  varchar - * */
    game_id: number| null;		/*  int - * */
    game_name: string| null;		/*  varchar - * */
    create_at: Date| null;		/*  datetime - * */
    end_at: Date| null;		/*  datetime - * */
}