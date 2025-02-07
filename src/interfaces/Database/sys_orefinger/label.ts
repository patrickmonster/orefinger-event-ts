/* AUTO CREATE TABLE INTERFACE :: 1738572455791 */
/* 라벨 치환하는 텍스트 입니다. */
type COLUMN = 'name' | 'language_cd' | 'text' | 'create_at' | 'update_at';
const columns : COLUMN[] = [ 'name','language_cd','text','create_at','update_at' ];
const pk : COLUMN[] = [ 'name','language_cd' ];

export const LABEL = 'label';
export const TABLE_COLUMNS_LABEL = columns;
const WHERE_LABEL = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_LABEL = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM sys_orefinger.label \nWHERE ${WHERE_LABEL(where)}`
export const INSERT_LABEL = (data: COLUMN[]) => ` INSERT INTO sys_orefinger.LABEL SET ${WHERE_LABEL(data)} `
export const UPDATE_LABEL = (data: COLUMN[]) => ` UPDATE sys_orefinger.LABEL SET ${WHERE_LABEL(data.filter(col=> !pk.includes(col)))}`
export const DELETE_LABEL = `UPDATE sys_orefinger.LABEL SET use_yn = 'N'`

export interface LABEL {
    name: string;		/* KEY(PRI) varchar - * */
    language_cd: number;		/* KEY(PRI) int - * */
    text: string;		/*  varchar - * */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
}