/* AUTO CREATE TABLE INTERFACE :: 1738571724405 */
/* 임베드 구조체 */
type COLUMN = 'user_id' | 'embed_type' | 'tag' | 'title' | 'description' | 'url' | 'timestamp' | 'color' | 'image' | 'thumbnail' | 'author_name' | 'author_url' | 'author_icon_url' | 'use_yn' | 'create_at' | 'update_at';
const columns : COLUMN[] = [ 'user_id','embed_type','tag','title','description','url','timestamp','color','image','thumbnail','author_name','author_url','author_icon_url','use_yn','create_at','update_at' ];
const pk : COLUMN[] = [  ];

export const EMBED_TWITCH_NOTICE = 'embed_twitch_notice';
export const TABLE_COLUMNS_EMBED_TWITCH_NOTICE = columns;
const WHERE_EMBED_TWITCH_NOTICE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_EMBED_TWITCH_NOTICE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.embed_twitch_notice \nWHERE ${WHERE_EMBED_TWITCH_NOTICE(where)}`
export const INSERT_EMBED_TWITCH_NOTICE = (data: COLUMN[]) => ` INSERT INTO discord.EMBED_TWITCH_NOTICE SET ${WHERE_EMBED_TWITCH_NOTICE(data)} `
export const UPDATE_EMBED_TWITCH_NOTICE = (data: COLUMN[]) => ` UPDATE discord.EMBED_TWITCH_NOTICE SET ${WHERE_EMBED_TWITCH_NOTICE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_EMBED_TWITCH_NOTICE = ` DELETE FROM discord.EMBED_TWITCH_NOTICE`

export interface EMBED_TWITCH_NOTICE {
    user_id: string;		/*  varchar - * */
    embed_type: number| null;		/*  bigint - 코맨트 */
    tag: string| null;		/*  varchar - 코맨트 */
    title: string| null;		/*  varchar - * */
    description: string| null;		/* KEY(MUL) varchar - * */
    url: string| null;		/*  varchar - * */
    timestamp: Date| null;		/*  timestamp - * */
    color: number| null;		/*  int - * */
    image: string| null;		/*  varchar - * */
    thumbnail: string| null;		/*  varchar - * */
    author_name: string| null;		/*  varchar - * */
    author_url: string| null;		/*  varchar - * */
    author_icon_url: string| null;		/*  varchar - * */
    use_yn: string| null;		/*  varchar - * */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
}