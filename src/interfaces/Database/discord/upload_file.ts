/* AUTO CREATE TABLE INTERFACE :: 1738571726618 */
/* 업로드 된 파일 옵션 링크 관리 */
type COLUMN = 'idx' | 'file_idx' | 'url' | 'id' | 'name' | 'owner' | 'permission' | 'create_at' | 'update_at';
const columns : COLUMN[] = [ 'idx','file_idx','url','id','name','owner','permission','create_at','update_at' ];
const pk : COLUMN[] = [ 'idx' ];

export const UPLOAD_FILE = 'upload_file';
export const TABLE_COLUMNS_UPLOAD_FILE = columns;
const WHERE_UPLOAD_FILE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_UPLOAD_FILE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.upload_file \nWHERE ${WHERE_UPLOAD_FILE(where)}`
export const INSERT_UPLOAD_FILE = (data: COLUMN[]) => ` INSERT INTO discord.UPLOAD_FILE SET ${WHERE_UPLOAD_FILE(data)} `
export const UPDATE_UPLOAD_FILE = (data: COLUMN[]) => ` UPDATE discord.UPLOAD_FILE SET ${WHERE_UPLOAD_FILE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_UPLOAD_FILE = ` UPDATE discord.UPLOAD_FILE SET use_yn = 'N'`

export interface UPLOAD_FILE {
    idx: number;		/* KEY(PRI) bigint - 옵션 pk */
    file_idx: number| null;		/* KEY(MUL) bigint - * */
    url: string| null;		/*  varchar - 파일 url */
    id: string| null;		/*  varchar - 파일 아이디 */
    name: string| null;		/*  varchar - 파일 이름 */
    owner: string| null;		/*  varchar - 파일 소유자 */
    permission: number| null;		/* KEY(MUL) int - 권한 */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
}