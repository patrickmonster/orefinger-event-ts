/* AUTO CREATE TABLE INTERFACE :: 1738571722598 */
/* 광고 관리
임베드 형식을 지향
https://discord.com/developers/docs/resources/channel#embed-object */
type COLUMN = 'advertisement_id' | 'description' | 'title' | 'url' | 'image' | 'thumbnail' | 'author' | 'author_img' | 'author_url' | 'fields' | 'color' | 'timestamp' | 'use_yn';
const columns : COLUMN[] = [ 'advertisement_id','description','title','url','image','thumbnail','author','author_img','author_url','fields','color','timestamp','use_yn' ];
const pk : COLUMN[] = [ 'advertisement_id' ];

export const ADVERTISEMENT = 'advertisement';
export const TABLE_COLUMNS_ADVERTISEMENT = columns;
const WHERE_ADVERTISEMENT = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_ADVERTISEMENT = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.advertisement \nWHERE ${WHERE_ADVERTISEMENT(where)}`
export const INSERT_ADVERTISEMENT = (data: COLUMN[]) => ` INSERT INTO discord.ADVERTISEMENT SET ${WHERE_ADVERTISEMENT(data)} `
export const UPDATE_ADVERTISEMENT = (data: COLUMN[]) => ` UPDATE discord.ADVERTISEMENT SET ${WHERE_ADVERTISEMENT(data.filter(col=> !pk.includes(col)))}`
export const DELETE_ADVERTISEMENT = ` DELETE FROM discord.ADVERTISEMENT`

export interface ADVERTISEMENT {
    advertisement_id: number;		/* KEY(PRI) bigint - * */
    description: string| null;		/*  text - * */
    title: string;		/*  varchar - 제목 */
    url: string| null;		/*  varchar - 타이틀 링크 */
    image: string| null;		/*  varchar - 매인이미지 */
    thumbnail: string| null;		/*  varchar - 프로필이미지 */
    author: string| null;		/*  varchar - 소유자 */
    author_img: string| null;		/*  varchar - 소유자 이미지 */
    author_url: string| null;		/*  varchar - 소유자 링크 */
    fields: number| null;		/*  int - 필드 - 다른테이블 연동 */
    color: string;		/*  varchar - 임베드 색상 */
    timestamp: Date| null;		/*  datetime - 표기시간 */
    use_yn: string| null;		/*  varchar - * */
}