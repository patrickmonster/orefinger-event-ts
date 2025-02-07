/* AUTO CREATE TABLE INTERFACE :: 1738571723738 */
/* 채팅 권한 */
type COLUMN = 'type' | 'name';
const columns : COLUMN[] = [ 'type','name' ];
const pk : COLUMN[] = [ 'type' ];

export const CHAT_PERMISSION_TYPE = 'chat_permission_type';
export const TABLE_COLUMNS_CHAT_PERMISSION_TYPE = columns;
const WHERE_CHAT_PERMISSION_TYPE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_CHAT_PERMISSION_TYPE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.chat_permission_type \nWHERE ${WHERE_CHAT_PERMISSION_TYPE(where)}`
export const INSERT_CHAT_PERMISSION_TYPE = (data: COLUMN[]) => ` INSERT INTO discord.CHAT_PERMISSION_TYPE SET ${WHERE_CHAT_PERMISSION_TYPE(data)} `
export const UPDATE_CHAT_PERMISSION_TYPE = (data: COLUMN[]) => ` UPDATE discord.CHAT_PERMISSION_TYPE SET ${WHERE_CHAT_PERMISSION_TYPE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_CHAT_PERMISSION_TYPE = ` UPDATE discord.CHAT_PERMISSION_TYPE SET use_yn = 'N'`

export interface CHAT_PERMISSION_TYPE {
    type: number;		/* KEY(PRI) int - 권한타입 */
    name: string| null;		/*  varchar - * */
}