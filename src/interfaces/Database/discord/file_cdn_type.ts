/* AUTO CREATE TABLE INTERFACE :: 1738571724952 */
/* 파일업로드 DB */
type COLUMN = 'idx' | 'name' | 'use_yn';
const columns : COLUMN[] = [ 'idx','name','use_yn' ];
const pk : COLUMN[] = [ 'idx' ];

export const FILE_CDN_TYPE = 'file_cdn_type';
export const TABLE_COLUMNS_FILE_CDN_TYPE = columns;
const WHERE_FILE_CDN_TYPE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_FILE_CDN_TYPE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.file_cdn_type \nWHERE ${WHERE_FILE_CDN_TYPE(where)}`
export const INSERT_FILE_CDN_TYPE = (data: COLUMN[]) => ` INSERT INTO discord.FILE_CDN_TYPE SET ${WHERE_FILE_CDN_TYPE(data)} `
export const UPDATE_FILE_CDN_TYPE = (data: COLUMN[]) => ` UPDATE discord.FILE_CDN_TYPE SET ${WHERE_FILE_CDN_TYPE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_FILE_CDN_TYPE = ` DELETE FROM discord.FILE_CDN_TYPE`

export interface FILE_CDN_TYPE {
    idx: number;		/* KEY(PRI) bigint - * */
    name: string| null;		/*  varchar - 파일명 */
    use_yn: string;		/*  char - * */
}