/* AUTO CREATE TABLE INTERFACE :: 1738571724343 */
/* 임베드 구조체 */
type COLUMN = 'embed_id' | 'embed_id' | 'tag' | 'tag' | 'title_idx' | 'title_id' | 'description_id' | 'description_id' | 'url' | 'url' | 'timestamp' | 'timestamp' | 'color' | 'color' | 'footer_text' | 'footer_text' | 'footer_icon_url' | 'icon_url' | 'image' | 'image' | 'image_id' | 'thumbnail' | 'thumbnail' | 'provider_name' | 'provider_url' | 'provider_name' | 'author_name' | 'provider_url' | 'author_url' | 'author_name' | 'author_icon_url' | 'author_url' | 'create_at' | 'author_icon_url' | 'update_at' | 'create_at' | 'update_at' | 'footer_icon_url' | 'title_id';
const columns : COLUMN[] = [ 'embed_id','embed_id','tag','tag','title_idx','title_id','description_id','description_id','url','url','timestamp','timestamp','color','color','footer_text','footer_text','footer_icon_url','icon_url','image','image','image_id','thumbnail','thumbnail','provider_name','provider_url','provider_name','author_name','provider_url','author_url','author_name','author_icon_url','author_url','create_at','author_icon_url','update_at','create_at','update_at','footer_icon_url','title_id' ];
const pk : COLUMN[] = [ 'embed_id','embed_id' ];

export const EMBED = 'embed';
export const TABLE_COLUMNS_EMBED = columns;
const WHERE_EMBED = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_EMBED = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.embed \nWHERE ${WHERE_EMBED(where)}`
export const INSERT_EMBED = (data: COLUMN[]) => ` INSERT INTO discord.EMBED SET ${WHERE_EMBED(data)} `
export const UPDATE_EMBED = (data: COLUMN[]) => ` UPDATE discord.EMBED SET ${WHERE_EMBED(data.filter(col=> !pk.includes(col)))}`
export const DELETE_EMBED = ` UPDATE discord.EMBED SET use_yn = 'N'`

export interface EMBED {
    embed_id: number;		/* KEY(PRI) bigint - * */
    tag: string| null;		/*  varchar - 코맨트 */
    title_idx: number| null;		/* KEY(MUL) bigint - * */
    title_id: number| null;		/* KEY(MUL) bigint - * */
    description_id: number| null;		/* KEY(MUL) bigint - * */
    url: string| null;		/*  varchar - * */
    timestamp: Date| null;		/*  timestamp - * */
    color: number| null;		/*  int - * */
    footer_text: string| null;		/*  varchar - * */
    footer_icon_url: string| null;		/*  varchar - * */
    icon_url: string| null;		/*  varchar - * */
    image: string| null;		/*  varchar - * */
    image_id: number| null;		/* KEY(MUL) bigint - * */
    thumbnail: string| null;		/*  varchar - * */
    provider_name: string| null;		/* KEY(MUL) varchar - * */
    provider_url: string| null;		/*  varchar - * */
    author_name: string| null;		/*  varchar - * */
    author_url: string| null;		/*  varchar - * */
    author_icon_url: string| null;		/*  varchar - * */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
}