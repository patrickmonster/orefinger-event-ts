/* AUTO CREATE TABLE INTERFACE :: 1738571722627 */
/* 광고 카운팅 테이블 */
type COLUMN = 'advertisement_id' | 'count' | 'game_id';
const columns : COLUMN[] = [ 'advertisement_id','count','game_id' ];
const pk : COLUMN[] = [ 'advertisement_id' ];

export const ADVERTISEMENT_CNT = 'advertisement_cnt';
export const TABLE_COLUMNS_ADVERTISEMENT_CNT = columns;
const WHERE_ADVERTISEMENT_CNT = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_ADVERTISEMENT_CNT = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.advertisement_cnt \nWHERE ${WHERE_ADVERTISEMENT_CNT(where)}`
export const INSERT_ADVERTISEMENT_CNT = (data: COLUMN[]) => ` INSERT INTO discord.ADVERTISEMENT_CNT SET ${WHERE_ADVERTISEMENT_CNT(data)} `
export const UPDATE_ADVERTISEMENT_CNT = (data: COLUMN[]) => ` UPDATE discord.ADVERTISEMENT_CNT SET ${WHERE_ADVERTISEMENT_CNT(data.filter(col=> !pk.includes(col)))}`
export const DELETE_ADVERTISEMENT_CNT = ` UPDATE discord.ADVERTISEMENT_CNT SET use_yn = 'N'`

export interface ADVERTISEMENT_CNT {
    advertisement_id: number;		/* KEY(PRI) bigint - * */
    count: number| null;		/*  bigint - * */
    game_id: number| null;		/*  int - * */
}