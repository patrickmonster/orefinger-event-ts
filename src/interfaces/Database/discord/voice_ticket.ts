/* AUTO CREATE TABLE INTERFACE :: 1738571726672 */
/* 음악 티켓 */
type COLUMN = 'channel_id' | 'create_at' | 'update_at' | 'use_yn' | 'create_user_id';
const columns : COLUMN[] = [ 'channel_id','create_at','update_at','use_yn','create_user_id' ];
const pk : COLUMN[] = [  ];

export const VOICE_TICKET = 'voice_ticket';
export const TABLE_COLUMNS_VOICE_TICKET = columns;
const WHERE_VOICE_TICKET = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_VOICE_TICKET = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.voice_ticket \nWHERE ${WHERE_VOICE_TICKET(where)}`
export const INSERT_VOICE_TICKET = (data: COLUMN[]) => ` INSERT INTO discord.VOICE_TICKET SET ${WHERE_VOICE_TICKET(data)} `
export const UPDATE_VOICE_TICKET = (data: COLUMN[]) => ` UPDATE discord.VOICE_TICKET SET ${WHERE_VOICE_TICKET(data.filter(col=> !pk.includes(col)))}`
export const DELETE_VOICE_TICKET = ` DELETE FROM discord.VOICE_TICKET`

export interface VOICE_TICKET {
    channel_id: string;		/*  char - * */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
    use_yn: string;		/*  varchar - 사용자 개별 설정 */
    create_user_id: string;		/*  char - * */
}