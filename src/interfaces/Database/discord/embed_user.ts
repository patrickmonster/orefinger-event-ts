/* AUTO CREATE TABLE INTERFACE :: 1738571724466 */
/* 임베드 구조체 - 사용자용 */
type COLUMN = 'embed_id' | 'title' | 'description' | 'url' | 'timestamp' | 'color' | 'footer_text' | 'footer_icon_url' | 'image' | 'thumbnail' | 'author_name' | 'author_url' | 'author_icon_url' | 'create_at' | 'update_at' | 'create_user' | 'update_user' | 'use_yn';
const columns : COLUMN[] = [ 'embed_id','title','description','url','timestamp','color','footer_text','footer_icon_url','image','thumbnail','author_name','author_url','author_icon_url','create_at','update_at','create_user','update_user','use_yn' ];
const pk : COLUMN[] = [ 'embed_id' ];

export const EMBED_USER = 'embed_user';
export const TABLE_COLUMNS_EMBED_USER = columns;
const WHERE_EMBED_USER = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_EMBED_USER = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.embed_user \nWHERE ${WHERE_EMBED_USER(where)}`
export const INSERT_EMBED_USER = (data: COLUMN[]) => ` INSERT INTO discord.EMBED_USER SET ${WHERE_EMBED_USER(data)} `
export const UPDATE_EMBED_USER = (data: COLUMN[]) => ` UPDATE discord.EMBED_USER SET ${WHERE_EMBED_USER(data.filter(col=> !pk.includes(col)))}`
export const DELETE_EMBED_USER = ` DELETE FROM discord.EMBED_USER`

export interface EMBED_USER {
    embed_id: number;		/* KEY(PRI) bigint - * */
    title: string| null;		/*  varchar - * */
    description: string| null;		/*  varchar - * */
    url: string| null;		/*  varchar - * */
    timestamp: Date| null;		/*  timestamp - * */
    color: number| null;		/*  int - * */
    footer_text: string| null;		/*  varchar - * */
    footer_icon_url: string| null;		/*  varchar - * */
    image: string| null;		/*  varchar - * */
    thumbnail: string| null;		/*  varchar - * */
    author_name: string| null;		/*  varchar - * */
    author_url: string| null;		/*  varchar - * */
    author_icon_url: string| null;		/*  varchar - * */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
    create_user: string| null;		/* KEY(MUL) char - 인증테이블의 사용자 */
    update_user: string| null;		/*  char - 인증테이블의 사용자 */
    use_yn: string| null;		/*  varchar - * */
}