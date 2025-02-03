/* AUTO CREATE TABLE INTERFACE :: 1738571726646 */
/* 비디오 저장 테이블 */
type COLUMN = 'video_id' | 'title' | 'channel_id' | 'create_at';
const columns : COLUMN[] = [ 'video_id','title','channel_id','create_at' ];
const pk : COLUMN[] = [  ];

export const VIDEO = 'video';
export const TABLE_COLUMNS_VIDEO = columns;
const WHERE_VIDEO = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_VIDEO = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.video \nWHERE ${WHERE_VIDEO(where)}`
export const INSERT_VIDEO = (data: COLUMN[]) => ` INSERT INTO discord.VIDEO SET ${WHERE_VIDEO(data)} `
export const UPDATE_VIDEO = (data: COLUMN[]) => ` UPDATE discord.VIDEO SET ${WHERE_VIDEO(data.filter(col=> !pk.includes(col)))}`
export const DELETE_VIDEO = ` UPDATE discord.VIDEO SET use_yn = 'N'`

export interface VIDEO {
    video_id: string;		/*  varchar - 비디오 고유값 */
    title: string| null;		/*  char - * */
    channel_id: string;		/*  varchar - * */
    create_at: Date;		/*  timestamp - * */
}