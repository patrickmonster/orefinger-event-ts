/* AUTO CREATE TABLE INTERFACE :: 1738571724785 */
/* 파티셔닝 로그
- 파티션 추가
ALTER TABLE event_log ADD PARTITION (PARTITION p6 VALUES LESS THAN (2026)) */
type COLUMN = 'type' | 'event_id' | 'data' | 'event_time';
const columns : COLUMN[] = [ 'type','event_id','data','event_time' ];
const pk : COLUMN[] = [  ];

export const EVENT_LOG = 'event_log';
export const TABLE_COLUMNS_EVENT_LOG = columns;
const WHERE_EVENT_LOG = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_EVENT_LOG = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.event_log \nWHERE ${WHERE_EVENT_LOG(where)}`
export const INSERT_EVENT_LOG = (data: COLUMN[]) => ` INSERT INTO discord.EVENT_LOG SET ${WHERE_EVENT_LOG(data)} `
export const UPDATE_EVENT_LOG = (data: COLUMN[]) => ` UPDATE discord.EVENT_LOG SET ${WHERE_EVENT_LOG(data.filter(col=> !pk.includes(col)))}`
export const DELETE_EVENT_LOG = ` UPDATE discord.EVENT_LOG SET use_yn = 'N'`

export interface EVENT_LOG {
    type: number| null;		/* KEY(MUL) int - 이벤트 타입 */
    event_id: string| null;		/* KEY(MUL) varchar - 이벤트 id */
    data: any| null;		/*  json - 수신오브젝트 */
    event_time: Date;		/* KEY(MUL) datetime - * */
}