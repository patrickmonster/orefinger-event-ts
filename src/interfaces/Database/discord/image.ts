/* AUTO CREATE TABLE INTERFACE :: 1738571725079 */
/* 이미지 저장 DB */
type COLUMN = 'idx' | 'name' | 'owenr' | 'cdn_url' | 'key' | 'delete_yn' | 'create_at' | 'update_at';
const columns : COLUMN[] = [ 'idx','name','owenr','cdn_url','key','delete_yn','create_at','update_at' ];
const pk : COLUMN[] = [ 'idx' ];

export const IMAGE = 'image';
export const TABLE_COLUMNS_IMAGE = columns;
const WHERE_IMAGE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_IMAGE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.image \nWHERE ${WHERE_IMAGE(where)}`
export const INSERT_IMAGE = (data: COLUMN[]) => ` INSERT INTO discord.IMAGE SET ${WHERE_IMAGE(data)} `
export const UPDATE_IMAGE = (data: COLUMN[]) => ` UPDATE discord.IMAGE SET ${WHERE_IMAGE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_IMAGE = ` UPDATE discord.IMAGE SET use_yn = 'N'`

export interface IMAGE {
    idx: string;		/* KEY(PRI) varchar - uuid */
    name: string| null;		/*  varchar - 파일명 */
    owenr: string| null;		/* KEY(MUL) char - 소유자 */
    cdn_url: string| null;		/*  varchar - CDN 엑세스 URL */
    key: string| null;		/*  varchar - 파일명 (저장명) */
    delete_yn: string;		/*  char - 삭제여부(엑세스X or 물리삭제) */
    create_at: Date;		/*  datetime - * */
    update_at: Date;		/*  datetime - * */
}