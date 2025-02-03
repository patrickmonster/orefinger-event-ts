/* AUTO CREATE TABLE INTERFACE :: 1738571723786 */
/*  */
type COLUMN = 'idx' | 'channel_id' | 'create_at' | 'update_at';
const columns : COLUMN[] = [ 'idx','channel_id','create_at','update_at' ];
const pk : COLUMN[] = [ 'channel_id' ];

export const CHAT_STATE = 'chat_state';
export const TABLE_COLUMNS_CHAT_STATE = columns;
const WHERE_CHAT_STATE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_CHAT_STATE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.chat_state \nWHERE ${WHERE_CHAT_STATE(where)}`
export const INSERT_CHAT_STATE = (data: COLUMN[]) => ` INSERT INTO discord.CHAT_STATE SET ${WHERE_CHAT_STATE(data)} `
export const UPDATE_CHAT_STATE = (data: COLUMN[]) => ` UPDATE discord.CHAT_STATE SET ${WHERE_CHAT_STATE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_CHAT_STATE = ` UPDATE discord.CHAT_STATE SET use_yn = 'N'`

export interface CHAT_STATE {
    idx: number;		/* KEY(MUL) bigint - 할당된id */
    channel_id: string;		/* KEY(PRI) char - 채널 정보 */
    create_at: Date;		/*  timestamp - * */
    update_at: Date;		/*  timestamp - * */
}