/* AUTO CREATE TABLE INTERFACE :: 1738572455426 */
/* 그룹과 컴포넌트를 중재
col */
type COLUMN = 'idx' | 'idx' | 'group_id' | 'group_id' | 'component_id' | 'component_id' | 'use_yn' | 'use_yn' | 'create_at' | 'create_at' | 'update_at' | 'update_at' | 'tag';
const columns : COLUMN[] = [ 'idx','idx','group_id','group_id','component_id','component_id','use_yn','use_yn','create_at','create_at','update_at','update_at','tag' ];
const pk : COLUMN[] = [ 'idx','idx' ];

export const COMPONENT_COL = 'component_col';
export const TABLE_COLUMNS_COMPONENT_COL = columns;
const WHERE_COMPONENT_COL = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_COMPONENT_COL = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM sys_orefinger.component_col \nWHERE ${WHERE_COMPONENT_COL(where)}`
export const INSERT_COMPONENT_COL = (data: COLUMN[]) => ` INSERT INTO sys_orefinger.COMPONENT_COL SET ${WHERE_COMPONENT_COL(data)} `
export const UPDATE_COMPONENT_COL = (data: COLUMN[]) => ` UPDATE sys_orefinger.COMPONENT_COL SET ${WHERE_COMPONENT_COL(data.filter(col=> !pk.includes(col)))}`
export const DELETE_COMPONENT_COL = `DELETE FROM sys_orefinger.COMPONENT_COL`

export interface COMPONENT_COL {
    idx: number;		/* KEY(PRI) bigint - * */
    group_id: number;		/* KEY(MUL) bigint - * */
    component_id: number;		/* KEY(MUL) bigint - * */
    use_yn: string| null;		/*  varchar - * */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
    tag: string| null;		/*  varchar - 컨포넌트 그룹 명 */
}