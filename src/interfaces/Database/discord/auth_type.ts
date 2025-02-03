/* AUTO CREATE TABLE INTERFACE :: 1738571723412 */
/* Discord user type */
type COLUMN = 'auth_type' | 'tag' | 'tag_kr' | 'create_at' | 'use_yn' | 'scope' | 'client_id' | 'target' | 'client_sc' | 'logout_url';
const columns : COLUMN[] = [ 'auth_type','tag','tag_kr','create_at','use_yn','scope','client_id','target','client_sc','logout_url' ];
const pk : COLUMN[] = [ 'auth_type' ];

export const AUTH_TYPE = 'auth_type';
export const TABLE_COLUMNS_AUTH_TYPE = columns;
const WHERE_AUTH_TYPE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_AUTH_TYPE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.auth_type \nWHERE ${WHERE_AUTH_TYPE(where)}`
export const INSERT_AUTH_TYPE = (data: COLUMN[]) => ` INSERT INTO discord.AUTH_TYPE SET ${WHERE_AUTH_TYPE(data)} `
export const UPDATE_AUTH_TYPE = (data: COLUMN[]) => ` UPDATE discord.AUTH_TYPE SET ${WHERE_AUTH_TYPE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_AUTH_TYPE = ` DELETE FROM discord.AUTH_TYPE`

export interface AUTH_TYPE {
    auth_type: number;		/* KEY(PRI) int - * */
    tag: string| null;		/*  varchar - 설명 */
    tag_kr: string| null;		/*  varchar - 설명 - 한국어 */
    create_at: Date| null;		/*  timestamp - * */
    use_yn: string| null;		/*  varchar - 인증 가능여부 - 프론트 노출 */
    scope: string| null;		/*  varchar - 권한 */
    client_id: string| null;		/*  varchar - 클라이언트 ID */
    target: string| null;		/*  varchar - url */
    client_sc: string| null;		/*  varchar - 클라이언트 ID */
    logout_url: string| null;		/*  varchar - url */
}