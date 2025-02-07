/* AUTO CREATE TABLE INTERFACE :: 1738571725963 */
/* discord permissions */
type COLUMN = 'name' | 'code' | 'description' | 'show_yn' | 'name_kr';
const columns : COLUMN[] = [ 'name','code','description','show_yn','name_kr' ];
const pk : COLUMN[] = [ 'code' ];

export const PERMISSIONS = 'permissions';
export const TABLE_COLUMNS_PERMISSIONS = columns;
const WHERE_PERMISSIONS = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_PERMISSIONS = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.permissions \nWHERE ${WHERE_PERMISSIONS(where)}`
export const INSERT_PERMISSIONS = (data: COLUMN[]) => ` INSERT INTO discord.PERMISSIONS SET ${WHERE_PERMISSIONS(data)} `
export const UPDATE_PERMISSIONS = (data: COLUMN[]) => ` UPDATE discord.PERMISSIONS SET ${WHERE_PERMISSIONS(data.filter(col=> !pk.includes(col)))}`
export const DELETE_PERMISSIONS = ` UPDATE discord.PERMISSIONS SET use_yn = 'N'`

export interface PERMISSIONS {
    name: string| null;		/*  varchar - * */
    code: number;		/* KEY(PRI) int - * */
    description: string| null;		/*  varchar - * */
    show_yn: string| null;		/*  char - * */
    name_kr: string| null;		/*  varchar - * */
}