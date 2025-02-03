/* AUTO CREATE TABLE INTERFACE :: 1738571724843 */
/* 라이브 스트리밍 정보 */
type COLUMN = 'event_id' | 'type' | 'live_mpd' | 'create_at';
const columns : COLUMN[] = [ 'event_id','type','live_mpd','create_at' ];
const pk : COLUMN[] = [ 'event_id','type' ];

export const EVENT_ONLINE_MPD = 'event_online_mpd';
export const TABLE_COLUMNS_EVENT_ONLINE_MPD = columns;
const WHERE_EVENT_ONLINE_MPD = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_EVENT_ONLINE_MPD = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.event_online_mpd \nWHERE ${WHERE_EVENT_ONLINE_MPD(where)}`
export const INSERT_EVENT_ONLINE_MPD = (data: COLUMN[]) => ` INSERT INTO discord.EVENT_ONLINE_MPD SET ${WHERE_EVENT_ONLINE_MPD(data)} `
export const UPDATE_EVENT_ONLINE_MPD = (data: COLUMN[]) => ` UPDATE discord.EVENT_ONLINE_MPD SET ${WHERE_EVENT_ONLINE_MPD(data.filter(col=> !pk.includes(col)))}`
export const DELETE_EVENT_ONLINE_MPD = ` UPDATE discord.EVENT_ONLINE_MPD SET use_yn = 'N'`

export interface EVENT_ONLINE_MPD {
    event_id: string;		/* KEY(PRI) varchar - * */
    type: number;		/* KEY(PRI) int - 이벤트 타입 */
    live_mpd: string| null;		/*  varchar - * */
    create_at: Date| null;		/*  datetime - * */
}