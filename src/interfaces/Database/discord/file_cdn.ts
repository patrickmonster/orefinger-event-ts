/* AUTO CREATE TABLE INTERFACE :: 1738571724926 */
/* 파일업로드 DB */
type COLUMN = 'idx' | 'name' | 'auth_id' | 'src' | 'create_at' | 'content_type' | 'physics_yn' | 'use_yn' | 'size' | 'type';
const columns : COLUMN[] = [ 'idx','name','auth_id','src','create_at','content_type','physics_yn','use_yn','size','type' ];
const pk : COLUMN[] = [ 'idx' ];

export const FILE_CDN = 'file_cdn';
export const TABLE_COLUMNS_FILE_CDN = columns;
const WHERE_FILE_CDN = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_FILE_CDN = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.file_cdn \nWHERE ${WHERE_FILE_CDN(where)}`
export const INSERT_FILE_CDN = (data: COLUMN[]) => ` INSERT INTO discord.FILE_CDN SET ${WHERE_FILE_CDN(data)} `
export const UPDATE_FILE_CDN = (data: COLUMN[]) => ` UPDATE discord.FILE_CDN SET ${WHERE_FILE_CDN(data.filter(col=> !pk.includes(col)))}`
export const DELETE_FILE_CDN = ` DELETE FROM discord.FILE_CDN`

export interface FILE_CDN {
    idx: number;		/* KEY(PRI) bigint - * */
    name: string| null;		/*  varchar - 파일명 */
    auth_id: string| null;		/* KEY(MUL) char - 소유자 */
    src: string| null;		/*  varchar - * */
    create_at: Date| null;		/*  timestamp - * */
    content_type: string| null;		/*  varchar - * */
    physics_yn: string| null;		/*  char - 소유자 */
    use_yn: string| null;		/*  char - 소유자 */
    size: number| null;		/*  bigint - 파일크기 */
    type: number;		/* KEY(MUL) bigint - * */
}