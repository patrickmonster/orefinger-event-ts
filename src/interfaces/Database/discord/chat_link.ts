/* AUTO CREATE TABLE INTERFACE :: 1738571723652 */
/* 채팅 링크 */
type COLUMN = 'idx' | 'create_at' | 'use_ym' | 'url';
const columns : COLUMN[] = [ 'idx','create_at','use_ym','url' ];
const pk : COLUMN[] = [ 'idx' ];

export const CHAT_LINK = 'chat_link';
export const TABLE_COLUMNS_CHAT_LINK = columns;
const WHERE_CHAT_LINK = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_CHAT_LINK = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.chat_link \nWHERE ${WHERE_CHAT_LINK(where)}`
export const INSERT_CHAT_LINK = (data: COLUMN[]) => ` INSERT INTO discord.CHAT_LINK SET ${WHERE_CHAT_LINK(data)} `
export const UPDATE_CHAT_LINK = (data: COLUMN[]) => ` UPDATE discord.CHAT_LINK SET ${WHERE_CHAT_LINK(data.filter(col=> !pk.includes(col)))}`
export const DELETE_CHAT_LINK = ` UPDATE discord.CHAT_LINK SET use_yn = 'N'`

export interface CHAT_LINK {
    idx: number;		/* KEY(PRI) bigint - * */
    create_at: Date;		/*  timestamp - * */
    use_ym: string;		/*  char - * */
    url: string;		/*  varchar - * */
}