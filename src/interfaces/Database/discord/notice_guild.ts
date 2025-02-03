/* AUTO CREATE TABLE INTERFACE :: 1738571725616 */
/*  */
type COLUMN = 'notice_id' | 'guild_id' | 'create_at' | 'update_at' | 'embed_id' | 'img_idx' | 'message' | 'name' | 'update_user_id' | 'use_yn';
const columns : COLUMN[] = [ 'notice_id','guild_id','create_at','update_at','embed_id','img_idx','message','name','update_user_id','use_yn' ];
const pk : COLUMN[] = [ 'notice_id','guild_id' ];

export const NOTICE_GUILD = 'notice_guild';
export const TABLE_COLUMNS_NOTICE_GUILD = columns;
const WHERE_NOTICE_GUILD = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_NOTICE_GUILD = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.notice_guild \nWHERE ${WHERE_NOTICE_GUILD(where)}`
export const INSERT_NOTICE_GUILD = (data: COLUMN[]) => ` INSERT INTO discord.NOTICE_GUILD SET ${WHERE_NOTICE_GUILD(data)} `
export const UPDATE_NOTICE_GUILD = (data: COLUMN[]) => ` UPDATE discord.NOTICE_GUILD SET ${WHERE_NOTICE_GUILD(data.filter(col=> !pk.includes(col)))}`
export const DELETE_NOTICE_GUILD = ` DELETE FROM discord.NOTICE_GUILD`

export interface NOTICE_GUILD {
    notice_id: number;		/* KEY(PRI) bigint - * */
    guild_id: string;		/* KEY(PRI) char - * */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
    embed_id: number| null;		/*  bigint - * */
    img_idx: number| null;		/*  bigint - * */
    message: any| null;		/*  mediumtext - * */
    name: string| null;		/*  varchar - * */
    update_user_id: string| null;		/*  char - * */
    use_yn: string;		/*  char - 사용자 개별 설정 */
}