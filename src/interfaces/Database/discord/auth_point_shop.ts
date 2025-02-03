/* AUTO CREATE TABLE INTERFACE :: 1738571723159 */
/* point 관리 테이블 */
type COLUMN = 'idx' | 'guild_id' | 'point' | 'name' | 'detail' | 'use_yn' | 'create_at' | 'update_at' | 'create_user' | 'update_user';
const columns : COLUMN[] = [ 'idx','guild_id','point','name','detail','use_yn','create_at','update_at','create_user','update_user' ];
const pk : COLUMN[] = [ 'idx' ];

export const AUTH_POINT_SHOP = 'auth_point_shop';
export const TABLE_COLUMNS_AUTH_POINT_SHOP = columns;
const WHERE_AUTH_POINT_SHOP = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_AUTH_POINT_SHOP = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.auth_point_shop \nWHERE ${WHERE_AUTH_POINT_SHOP(where)}`
export const INSERT_AUTH_POINT_SHOP = (data: COLUMN[]) => ` INSERT INTO discord.AUTH_POINT_SHOP SET ${WHERE_AUTH_POINT_SHOP(data)} `
export const UPDATE_AUTH_POINT_SHOP = (data: COLUMN[]) => ` UPDATE discord.AUTH_POINT_SHOP SET ${WHERE_AUTH_POINT_SHOP(data.filter(col=> !pk.includes(col)))}`
export const DELETE_AUTH_POINT_SHOP = ` DELETE FROM discord.AUTH_POINT_SHOP`

export interface AUTH_POINT_SHOP {
    idx: number;		/* KEY(PRI) bigint - * */
    guild_id: string;		/* KEY(MUL) char - * */
    point: number| null;		/*  bigint - 포인트 금액 */
    name: string| null;		/*  varchar - 상품명 */
    detail: string| null;		/*  varchar - 상품명 */
    use_yn: string;		/*  varchar - 사용유무 */
    create_at: Date;		/*  datetime - * */
    update_at: Date;		/*  datetime - * */
    create_user: string;		/*  char - * */
    update_user: string;		/*  char - * */
}