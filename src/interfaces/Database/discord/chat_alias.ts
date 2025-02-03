/* AUTO CREATE TABLE INTERFACE :: 1738571723513 */
/* 채팅 별칭 */
type COLUMN = 'idx' | 'origin' | 'description' | 'create_at' | 'use_ym';
const columns : COLUMN[] = [ 'idx','origin','description','create_at','use_ym' ];
const pk : COLUMN[] = [ 'idx' ];

export const CHAT_ALIAS = 'chat_alias';
export const TABLE_COLUMNS_CHAT_ALIAS = columns;
const WHERE_CHAT_ALIAS = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_CHAT_ALIAS = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.chat_alias \nWHERE ${WHERE_CHAT_ALIAS(where)}`
export const INSERT_CHAT_ALIAS = (data: COLUMN[]) => ` INSERT INTO discord.CHAT_ALIAS SET ${WHERE_CHAT_ALIAS(data)} `
export const UPDATE_CHAT_ALIAS = (data: COLUMN[]) => ` UPDATE discord.CHAT_ALIAS SET ${WHERE_CHAT_ALIAS(data.filter(col=> !pk.includes(col)))}`
export const DELETE_CHAT_ALIAS = ` UPDATE discord.CHAT_ALIAS SET use_yn = 'N'`

export interface CHAT_ALIAS {
    idx: number;		/* KEY(PRI) bigint - * */
    origin: string;		/*  varchar - * */
    description: string;		/*  varchar - 출력 메세지 */
    create_at: Date;		/*  timestamp - * */
    use_ym: string;		/*  char - * */
}