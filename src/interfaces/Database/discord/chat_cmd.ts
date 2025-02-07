/* AUTO CREATE TABLE INTERFACE :: 1738571723551 */
/* 채팅 명령어 */
type COLUMN = 'command' | 'channel_id' | 'message' | 'type' | 'create_at' | 'option' | 'count' | 'use_yn';
const columns : COLUMN[] = [ 'command','channel_id','message','type','create_at','option','count','use_yn' ];
const pk : COLUMN[] = [ 'command','channel_id' ];

export const CHAT_CMD = 'chat_cmd';
export const TABLE_COLUMNS_CHAT_CMD = columns;
const WHERE_CHAT_CMD = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_CHAT_CMD = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.chat_cmd \nWHERE ${WHERE_CHAT_CMD(where)}`
export const INSERT_CHAT_CMD = (data: COLUMN[]) => ` INSERT INTO discord.CHAT_CMD SET ${WHERE_CHAT_CMD(data)} `
export const UPDATE_CHAT_CMD = (data: COLUMN[]) => ` UPDATE discord.CHAT_CMD SET ${WHERE_CHAT_CMD(data.filter(col=> !pk.includes(col)))}`
export const DELETE_CHAT_CMD = ` DELETE FROM discord.CHAT_CMD`

export interface CHAT_CMD {
    command: string;		/* KEY(PRI) varchar - * */
    channel_id: string;		/* KEY(PRI) char - 채널 정보 */
    message: string;		/*  varchar - 출력 메세지 */
    type: number;		/* KEY(MUL) int - 명령타입 */
    create_at: Date;		/*  timestamp - * */
    option: string| null;		/*  varchar - 옵션 */
    count: number;		/*  bigint - 출력 메세지 */
    use_yn: string;		/*  char - 사용여부 */
}