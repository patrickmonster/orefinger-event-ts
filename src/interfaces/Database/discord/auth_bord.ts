/* AUTO CREATE TABLE INTERFACE :: 1738571722790 */
/* 인증 보드
(기존에 이벤트 테이블의 인증 관련 그룹만 땡겨옴) */
type COLUMN = 'guild_id' | 'type' | 'role_id' | 'embed_id' | 'use_yn' | 'create_at' | 'update_at' | 'nick_name';
const columns : COLUMN[] = [ 'guild_id','type','role_id','embed_id','use_yn','create_at','update_at','nick_name' ];
const pk : COLUMN[] = [ 'guild_id','type' ];

export const AUTH_BORD = 'auth_bord';
export const TABLE_COLUMNS_AUTH_BORD = columns;
const WHERE_AUTH_BORD = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_AUTH_BORD = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.auth_bord \nWHERE ${WHERE_AUTH_BORD(where)}`
export const INSERT_AUTH_BORD = (data: COLUMN[]) => ` INSERT INTO discord.AUTH_BORD SET ${WHERE_AUTH_BORD(data)} `
export const UPDATE_AUTH_BORD = (data: COLUMN[]) => ` UPDATE discord.AUTH_BORD SET ${WHERE_AUTH_BORD(data.filter(col=> !pk.includes(col)))}`
export const DELETE_AUTH_BORD = ` DELETE FROM discord.AUTH_BORD`

export interface AUTH_BORD {
    guild_id: string;		/* KEY(PRI) varchar - 고유 id
 */
    type: number;		/* KEY(PRI) int - 이벤트 타입 */
    role_id: string;		/*  varchar - 고유 id
 */
    embed_id: number| null;		/*  bigint - * */
    use_yn: string;		/*  varchar - 사용유무 */
    create_at: Date;		/*  timestamp - * */
    update_at: Date;		/*  timestamp - * */
    nick_name: string;		/*  varchar - * */
}