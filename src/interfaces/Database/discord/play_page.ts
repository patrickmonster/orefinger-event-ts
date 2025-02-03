/* AUTO CREATE TABLE INTERFACE :: 1738571726053 */
/* 음악책 -> 재생책 */
type COLUMN = 'auth_id' | 'create_at' | 'update_at' | 'css' | 'channel_id';
const columns : COLUMN[] = [ 'auth_id','create_at','update_at','css','channel_id' ];
const pk : COLUMN[] = [ 'auth_id' ];

export const PLAY_PAGE = 'play_page';
export const TABLE_COLUMNS_PLAY_PAGE = columns;
const WHERE_PLAY_PAGE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_PLAY_PAGE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.play_page \nWHERE ${WHERE_PLAY_PAGE(where)}`
export const INSERT_PLAY_PAGE = (data: COLUMN[]) => ` INSERT INTO discord.PLAY_PAGE SET ${WHERE_PLAY_PAGE(data)} `
export const UPDATE_PLAY_PAGE = (data: COLUMN[]) => ` UPDATE discord.PLAY_PAGE SET ${WHERE_PLAY_PAGE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_PLAY_PAGE = ` UPDATE discord.PLAY_PAGE SET use_yn = 'N'`

export interface PLAY_PAGE {
    auth_id: string;		/* KEY(PRI) char - * */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
    css: any| null;		/*  mediumtext - 꾸미기 CSS */
    channel_id: string| null;		/* KEY(MUL) char - * */
}