/* AUTO CREATE TABLE INTERFACE :: 1738571724869 */
/*  */
type COLUMN = 'video_id' | 'channel_id' | 'title' | 'create_at';
const columns : COLUMN[] = [ 'video_id','channel_id','title','create_at' ];
const pk : COLUMN[] = [ 'video_id' ];

export const EVENT_VIDEO = 'event_video';
export const TABLE_COLUMNS_EVENT_VIDEO = columns;
const WHERE_EVENT_VIDEO = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_EVENT_VIDEO = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.event_video \nWHERE ${WHERE_EVENT_VIDEO(where)}`
export const INSERT_EVENT_VIDEO = (data: COLUMN[]) => ` INSERT INTO discord.EVENT_VIDEO SET ${WHERE_EVENT_VIDEO(data)} `
export const UPDATE_EVENT_VIDEO = (data: COLUMN[]) => ` UPDATE discord.EVENT_VIDEO SET ${WHERE_EVENT_VIDEO(data.filter(col=> !pk.includes(col)))}`
export const DELETE_EVENT_VIDEO = ` UPDATE discord.EVENT_VIDEO SET use_yn = 'N'`

export interface EVENT_VIDEO {
    video_id: string;		/* KEY(PRI) varchar - * */
    channel_id: string;		/* KEY(MUL) varchar - * */
    title: string| null;		/*  varchar - * */
    create_at: Date| null;		/*  timestamp - * */
}