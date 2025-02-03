/* AUTO CREATE TABLE INTERFACE :: 1738571723354 */
/* 인증기관


ALTER TABLE auth_token ADD PARTITION (
	PARTITION ``twitch.affiliate`` VALUES LESS THAN (36),
	PARTITION ``twitch.partner`` VALUES LESS THAN (37)
) */
type COLUMN = 'user_id' | 'type' | 'login' | 'name' | 'name_alias' | 'user_type' | 'email' | 'avatar' | 'refresh_token' | 'is_session' | 'create_at' | 'update_at' | 'use_search_yn';
const columns : COLUMN[] = [ 'user_id','type','login','name','name_alias','user_type','email','avatar','refresh_token','is_session','create_at','update_at','use_search_yn' ];
const pk : COLUMN[] = [ 'user_id','type' ];

export const AUTH_TOKEN = 'auth_token';
export const TABLE_COLUMNS_AUTH_TOKEN = columns;
const WHERE_AUTH_TOKEN = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_AUTH_TOKEN = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.auth_token \nWHERE ${WHERE_AUTH_TOKEN(where)}`
export const INSERT_AUTH_TOKEN = (data: COLUMN[]) => ` INSERT INTO discord.AUTH_TOKEN SET ${WHERE_AUTH_TOKEN(data)} `
export const UPDATE_AUTH_TOKEN = (data: COLUMN[]) => ` UPDATE discord.AUTH_TOKEN SET ${WHERE_AUTH_TOKEN(data.filter(col=> !pk.includes(col)))}`
export const DELETE_AUTH_TOKEN = ` UPDATE discord.AUTH_TOKEN SET use_yn = 'N'`

export interface AUTH_TOKEN {
    user_id: string;		/* KEY(PRI) varchar - 고유 id\n */
    type: number;		/* KEY(PRI) int - * */
    login: string| null;		/*  char - 영문 이름 */
    name: string;		/*  char - * */
    name_alias: string| null;		/*  char - 닉네임 정보를 알 수 없는경우 예외값 */
    user_type: number;		/* KEY(MUL) int - 사용자 타입 */
    email: string| null;		/*  varchar - * */
    avatar: string| null;		/*  varchar - * */
    refresh_token: string;		/*  varchar - * */
    is_session: string| null;		/*  varchar - * */
    create_at: Date;		/*  timestamp - * */
    update_at: Date;		/*  timestamp - * */
    use_search_yn: string| null;		/*  char - * */
}