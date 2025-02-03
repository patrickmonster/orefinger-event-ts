/* AUTO CREATE TABLE INTERFACE :: 1738571725726 */
/* 알림 이력
 - 중복 알림 필터링을 위한 테이블 */
type COLUMN = 'notice_id' | 'id' | 'create_at' | 'live_at' | 'end_at' | 'image' | 'title' | 'game' | 'chat';
const columns : COLUMN[] = [ 'notice_id','id','create_at','live_at','end_at','image','title','game','chat' ];
const pk : COLUMN[] = [ 'notice_id','id' ];

export const NOTICE_LIVE = 'notice_live';
export const TABLE_COLUMNS_NOTICE_LIVE = columns;
const WHERE_NOTICE_LIVE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_NOTICE_LIVE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.notice_live \nWHERE ${WHERE_NOTICE_LIVE(where)}`
export const INSERT_NOTICE_LIVE = (data: COLUMN[]) => ` INSERT INTO discord.NOTICE_LIVE SET ${WHERE_NOTICE_LIVE(data)} `
export const UPDATE_NOTICE_LIVE = (data: COLUMN[]) => ` UPDATE discord.NOTICE_LIVE SET ${WHERE_NOTICE_LIVE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_NOTICE_LIVE = ` UPDATE discord.NOTICE_LIVE SET use_yn = 'N'`

export interface NOTICE_LIVE {
    notice_id: number;		/* KEY(PRI) bigint - * */
    id: string;		/* KEY(PRI) varchar - * */
    create_at: Date;		/*  timestamp - 전송 수신 시간 */
    live_at: Date| null;		/*  timestamp - 라이브 실제 시작 시간 */
    end_at: Date| null;		/*  timestamp - * */
    image: string| null;		/*  varchar - * */
    title: string| null;		/*  varchar - * */
    game: string| null;		/*  varchar - * */
    chat: string| null;		/*  char - * */
}