/* AUTO CREATE TABLE INTERFACE :: 1738571724896 */
/* 파일업로드 DB */
type COLUMN = 'idx' | 'name' | 'owenr' | 'src' | 'create_at' | 'content_type';
const columns : COLUMN[] = [ 'idx','name','owenr','src','create_at','content_type' ];
const pk : COLUMN[] = [ 'idx' ];

export const FILE = 'file';
export const TABLE_COLUMNS_FILE = columns;
const WHERE_FILE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_FILE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.file \nWHERE ${WHERE_FILE(where)}`
export const INSERT_FILE = (data: COLUMN[]) => ` INSERT INTO discord.FILE SET ${WHERE_FILE(data)} `
export const UPDATE_FILE = (data: COLUMN[]) => ` UPDATE discord.FILE SET ${WHERE_FILE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_FILE = ` UPDATE discord.FILE SET use_yn = 'N'`

export interface FILE {
    idx: number;		/* KEY(PRI) bigint - * */
    name: string| null;		/*  varchar - 파일명 */
    owenr: string| null;		/*  char - 소유자 */
    src: any| null;		/*  longblob - * */
    create_at: Date| null;		/*  timestamp - * */
    content_type: string| null;		/*  varchar - * */
}