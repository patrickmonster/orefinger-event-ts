/* AUTO CREATE TABLE INTERFACE :: 1738571724501 */
/* 문의사항 - 1-1 채팅 */
type COLUMN = 'auth_id' | 'channel_id' | 'dm_id' | 'create_at' | 'update_at' | 'use_yn';
const columns : COLUMN[] = [ 'auth_id','channel_id','dm_id','create_at','update_at','use_yn' ];
const pk : COLUMN[] = [ 'auth_id','channel_id' ];

export const ENQUIRY = 'enquiry';
export const TABLE_COLUMNS_ENQUIRY = columns;
const WHERE_ENQUIRY = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_ENQUIRY = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.enquiry \nWHERE ${WHERE_ENQUIRY(where)}`
export const INSERT_ENQUIRY = (data: COLUMN[]) => ` INSERT INTO discord.ENQUIRY SET ${WHERE_ENQUIRY(data)} `
export const UPDATE_ENQUIRY = (data: COLUMN[]) => ` UPDATE discord.ENQUIRY SET ${WHERE_ENQUIRY(data.filter(col=> !pk.includes(col)))}`
export const DELETE_ENQUIRY = ` DELETE FROM discord.ENQUIRY`

export interface ENQUIRY {
    auth_id: string;		/* KEY(PRI) varchar - 사용자 */
    channel_id: string;		/* KEY(PRI) varchar - 포럼채널 */
    dm_id: string;		/*  varchar - 개인채널 */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
    use_yn: string| null;		/*  varchar - * */
}