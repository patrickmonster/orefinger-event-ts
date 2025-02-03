/* AUTO CREATE TABLE INTERFACE :: 1738571723609 */
/* 인증기관 */
type COLUMN = 'type' | 'name' | 'create_at' | 'use_yn';
const columns : COLUMN[] = [ 'type','name','create_at','use_yn' ];
const pk : COLUMN[] = [ 'type' ];

export const CHAT_CMD_TYPE = 'chat_cmd_type';
export const TABLE_COLUMNS_CHAT_CMD_TYPE = columns;
const WHERE_CHAT_CMD_TYPE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_CHAT_CMD_TYPE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.chat_cmd_type \nWHERE ${WHERE_CHAT_CMD_TYPE(where)}`
export const INSERT_CHAT_CMD_TYPE = (data: COLUMN[]) => ` INSERT INTO discord.CHAT_CMD_TYPE SET ${WHERE_CHAT_CMD_TYPE(data)} `
export const UPDATE_CHAT_CMD_TYPE = (data: COLUMN[]) => ` UPDATE discord.CHAT_CMD_TYPE SET ${WHERE_CHAT_CMD_TYPE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_CHAT_CMD_TYPE = ` DELETE FROM discord.CHAT_CMD_TYPE`

export interface CHAT_CMD_TYPE {
    type: number;		/* KEY(PRI) int - 고유 id\n */
    name: string| null;		/*  varchar - * */
    create_at: Date;		/*  timestamp - * */
    use_yn: string;		/*  char - 사용여부 */
}