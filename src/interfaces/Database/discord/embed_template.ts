/* AUTO CREATE TABLE INTERFACE :: 1738571724375 */
/* 임베드 전송 템플릿 - 커스터마이징용 */
type COLUMN = 'user_id' | 'type' | 'embed_id' | 'create_at' | 'update_at';
const columns : COLUMN[] = [ 'user_id','type','embed_id','create_at','update_at' ];
const pk : COLUMN[] = [ 'user_id','type','embed_id' ];

export const EMBED_TEMPLATE = 'embed_template';
export const TABLE_COLUMNS_EMBED_TEMPLATE = columns;
const WHERE_EMBED_TEMPLATE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_EMBED_TEMPLATE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.embed_template \nWHERE ${WHERE_EMBED_TEMPLATE(where)}`
export const INSERT_EMBED_TEMPLATE = (data: COLUMN[]) => ` INSERT INTO discord.EMBED_TEMPLATE SET ${WHERE_EMBED_TEMPLATE(data)} `
export const UPDATE_EMBED_TEMPLATE = (data: COLUMN[]) => ` UPDATE discord.EMBED_TEMPLATE SET ${WHERE_EMBED_TEMPLATE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_EMBED_TEMPLATE = ` UPDATE discord.EMBED_TEMPLATE SET use_yn = 'N'`

export interface EMBED_TEMPLATE {
    user_id: string;		/* KEY(PRI) varchar - 고유 id
 */
    type: number;		/* KEY(PRI) int - 이벤트 타입 */
    embed_id: number;		/* KEY(PRI) bigint - * */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
}