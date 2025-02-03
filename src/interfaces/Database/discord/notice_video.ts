/* AUTO CREATE TABLE INTERFACE :: 1738571725789 */
/*  */
type COLUMN = 'video_id' | 'title' | 'create_at' | 'notice_id';
const columns : COLUMN[] = [ 'video_id','title','create_at','notice_id' ];
const pk : COLUMN[] = [ 'video_id' ];

export const NOTICE_VIDEO = 'notice_video';
export const TABLE_COLUMNS_NOTICE_VIDEO = columns;
const WHERE_NOTICE_VIDEO = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_NOTICE_VIDEO = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.notice_video \nWHERE ${WHERE_NOTICE_VIDEO(where)}`
export const INSERT_NOTICE_VIDEO = (data: COLUMN[]) => ` INSERT INTO discord.NOTICE_VIDEO SET ${WHERE_NOTICE_VIDEO(data)} `
export const UPDATE_NOTICE_VIDEO = (data: COLUMN[]) => ` UPDATE discord.NOTICE_VIDEO SET ${WHERE_NOTICE_VIDEO(data.filter(col=> !pk.includes(col)))}`
export const DELETE_NOTICE_VIDEO = ` UPDATE discord.NOTICE_VIDEO SET use_yn = 'N'`

export interface NOTICE_VIDEO {
    video_id: string;		/* KEY(PRI) varchar - * */
    title: string| null;		/*  varchar - * */
    create_at: Date| null;		/*  timestamp - * */
    notice_id: number;		/* KEY(MUL) bigint - * */
}