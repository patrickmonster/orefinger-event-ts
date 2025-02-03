/* AUTO CREATE TABLE INTERFACE :: 1738571725540 */
/* 알림 채널 */
type COLUMN = 'channel_id' | 'notice_id' | 'guild_id' | 'create_at' | 'update_at' | 'use_yn' | 'create_user_id';
const columns : COLUMN[] = [ 'channel_id','notice_id','guild_id','create_at','update_at','use_yn','create_user_id' ];
const pk : COLUMN[] = [ 'channel_id','notice_id' ];

export const NOTICE_CHANNEL = 'notice_channel';
export const TABLE_COLUMNS_NOTICE_CHANNEL = columns;
const WHERE_NOTICE_CHANNEL = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_NOTICE_CHANNEL = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.notice_channel \nWHERE ${WHERE_NOTICE_CHANNEL(where)}`
export const INSERT_NOTICE_CHANNEL = (data: COLUMN[]) => ` INSERT INTO discord.NOTICE_CHANNEL SET ${WHERE_NOTICE_CHANNEL(data)} `
export const UPDATE_NOTICE_CHANNEL = (data: COLUMN[]) => ` UPDATE discord.NOTICE_CHANNEL SET ${WHERE_NOTICE_CHANNEL(data.filter(col=> !pk.includes(col)))}`
export const DELETE_NOTICE_CHANNEL = ` DELETE FROM discord.NOTICE_CHANNEL`

export interface NOTICE_CHANNEL {
    channel_id: string;		/* KEY(PRI) char - * */
    notice_id: number;		/* KEY(PRI) bigint - * */
    guild_id: string| null;		/* KEY(MUL) char - * */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
    use_yn: string;		/*  varchar - 사용자 개별 설정 */
    create_user_id: string;		/* KEY(MUL) char - * */
}