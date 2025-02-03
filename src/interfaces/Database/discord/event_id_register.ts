/* AUTO CREATE TABLE INTERFACE :: 1738571724731 */
/* 이벤트 오류 */
type COLUMN = 'type' | 'user_id' | 'token' | 'data' | 'create_at';
const columns : COLUMN[] = [ 'type','user_id','token','data','create_at' ];
const pk : COLUMN[] = [  ];

export const EVENT_ID_REGISTER = 'event_id_register';
export const TABLE_COLUMNS_EVENT_ID_REGISTER = columns;
const WHERE_EVENT_ID_REGISTER = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_EVENT_ID_REGISTER = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.event_id_register \nWHERE ${WHERE_EVENT_ID_REGISTER(where)}`
export const INSERT_EVENT_ID_REGISTER = (data: COLUMN[]) => ` INSERT INTO discord.EVENT_ID_REGISTER SET ${WHERE_EVENT_ID_REGISTER(data)} `
export const UPDATE_EVENT_ID_REGISTER = (data: COLUMN[]) => ` UPDATE discord.EVENT_ID_REGISTER SET ${WHERE_EVENT_ID_REGISTER(data.filter(col=> !pk.includes(col)))}`
export const DELETE_EVENT_ID_REGISTER = ` UPDATE discord.EVENT_ID_REGISTER SET use_yn = 'N'`

export interface EVENT_ID_REGISTER {
    type: number;		/*  int - 이벤트 타입 */
    user_id: string;		/*  varchar - 고유 id
 */
    token: string| null;		/*  varchar - 이벤트 ID
 */
    data: any;		/*  json - * */
    create_at: Date;		/*  timestamp - * */
}