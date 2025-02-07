/* AUTO CREATE TABLE INTERFACE :: 1738571726702 */
/* 채널별 훅을 관리합니다 */
type COLUMN = 'channel_id' | 'webhook_id' | 'token' | 'embed_id' | 'guild_id' | 'name' | 'img_idx' | 'create_at' | 'update_at' | 'auth_id' | 'use_yn';
const columns : COLUMN[] = [ 'channel_id','webhook_id','token','embed_id','guild_id','name','img_idx','create_at','update_at','auth_id','use_yn' ];
const pk : COLUMN[] = [ 'channel_id' ];

export const WEBHOOKS = 'webhooks';
export const TABLE_COLUMNS_WEBHOOKS = columns;
const WHERE_WEBHOOKS = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_WEBHOOKS = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.webhooks \nWHERE ${WHERE_WEBHOOKS(where)}`
export const INSERT_WEBHOOKS = (data: COLUMN[]) => ` INSERT INTO discord.WEBHOOKS SET ${WHERE_WEBHOOKS(data)} `
export const UPDATE_WEBHOOKS = (data: COLUMN[]) => ` UPDATE discord.WEBHOOKS SET ${WHERE_WEBHOOKS(data.filter(col=> !pk.includes(col)))}`
export const DELETE_WEBHOOKS = ` DELETE FROM discord.WEBHOOKS`

export interface WEBHOOKS {
    channel_id: string;		/* KEY(PRI) char - * */
    webhook_id: string;		/*  varchar - * */
    token: string| null;		/*  varchar - * */
    embed_id: number| null;		/* KEY(MUL) bigint - * */
    guild_id: string| null;		/* KEY(MUL) char - * */
    name: string| null;		/*  varchar - * */
    img_idx: number| null;		/* KEY(MUL) bigint - * */
    create_at: Date;		/*  timestamp - * */
    update_at: Date;		/*  timestamp - * */
    auth_id: string| null;		/*  char - * */
    use_yn: string;		/*  varchar - 사용자 개별 설정 */
}