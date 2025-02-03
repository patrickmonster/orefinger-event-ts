/* AUTO CREATE TABLE INTERFACE :: 1738571724643 */
/* 이벤트 전송 채널 */
type COLUMN = 'type' | 'user_id' | 'name' | 'guild_id' | 'channel_id' | 'custom_ment' | 'hook_id' | 'hook_token' | 'delete_yn' | 'create_at' | 'update_at';
const columns : COLUMN[] = [ 'type','user_id','name','guild_id','channel_id','custom_ment','hook_id','hook_token','delete_yn','create_at','update_at' ];
const pk : COLUMN[] = [ 'type','user_id','channel_id' ];

export const EVENT_CHANNEL = 'event_channel';
export const TABLE_COLUMNS_EVENT_CHANNEL = columns;
const WHERE_EVENT_CHANNEL = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_EVENT_CHANNEL = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.event_channel \nWHERE ${WHERE_EVENT_CHANNEL(where)}`
export const INSERT_EVENT_CHANNEL = (data: COLUMN[]) => ` INSERT INTO discord.EVENT_CHANNEL SET ${WHERE_EVENT_CHANNEL(data)} `
export const UPDATE_EVENT_CHANNEL = (data: COLUMN[]) => ` UPDATE discord.EVENT_CHANNEL SET ${WHERE_EVENT_CHANNEL(data.filter(col=> !pk.includes(col)))}`
export const DELETE_EVENT_CHANNEL = ` UPDATE discord.EVENT_CHANNEL SET use_yn = 'N'`

export interface EVENT_CHANNEL {
    type: number;		/* KEY(PRI) int - 이벤트 타입 */
    user_id: string;		/* KEY(PRI) varchar - 고유 id
 */
    name: string| null;		/*  varchar - 출력이름 */
    guild_id: string| null;		/*  char - * */
    channel_id: string;		/* KEY(PRI) char - * */
    custom_ment: string| null;		/*  text - * */
    hook_id: string| null;		/*  char - * */
    hook_token: string| null;		/*  varchar - * */
    delete_yn: string| null;		/*  char - 사용유무 */
    create_at: Date;		/*  timestamp - * */
    update_at: Date;		/*  timestamp - * */
}