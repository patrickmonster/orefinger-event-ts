/* AUTO CREATE TABLE INTERFACE :: 1738571724677 */
/* 클립 관리자 */
type COLUMN = 'cilp_id' | 'title' | 'auth_id' | 'game_id' | 'url' | 'create_at' | 'proxy_url' | 'size';
const columns : COLUMN[] = [ 'cilp_id','title','auth_id','game_id','url','create_at','proxy_url','size' ];
const pk : COLUMN[] = [ 'cilp_id' ];

export const EVENT_CLIP = 'event_clip';
export const TABLE_COLUMNS_EVENT_CLIP = columns;
const WHERE_EVENT_CLIP = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_EVENT_CLIP = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.event_clip \nWHERE ${WHERE_EVENT_CLIP(where)}`
export const INSERT_EVENT_CLIP = (data: COLUMN[]) => ` INSERT INTO discord.EVENT_CLIP SET ${WHERE_EVENT_CLIP(data)} `
export const UPDATE_EVENT_CLIP = (data: COLUMN[]) => ` UPDATE discord.EVENT_CLIP SET ${WHERE_EVENT_CLIP(data.filter(col=> !pk.includes(col)))}`
export const DELETE_EVENT_CLIP = ` UPDATE discord.EVENT_CLIP SET use_yn = 'N'`

export interface EVENT_CLIP {
    cilp_id: string;		/* KEY(PRI) char - * */
    title: string| null;		/*  varchar - * */
    auth_id: string| null;		/* KEY(MUL) char - * */
    game_id: number;		/* KEY(MUL) int - 카테고리 */
    url: string;		/*  varchar - 저장위치 */
    create_at: Date| null;		/*  datetime - * */
    proxy_url: string;		/*  varchar - 저장위치 */
    size: number| null;		/*  bigint - * */
}