/* AUTO CREATE TABLE INTERFACE :: 1738572455515 */
/* 그룹과 컴포넌트를 중재 */
type COLUMN = 'idx' | 'idx' | 'group_id' | 'group_id' | 'component_id' | 'component_id' | 'use_yn' | 'use_yn' | 'create_at' | 'create_at' | 'update_at' | 'update_at' | 'tag';
const columns : COLUMN[] = [ 'idx','idx','group_id','group_id','component_id','component_id','use_yn','use_yn','create_at','create_at','update_at','update_at','tag' ];
const pk : COLUMN[] = [ 'idx','idx' ];

export const COMPONENT_LOW = 'component_low';
export const TABLE_COLUMNS_COMPONENT_LOW = columns;
const WHERE_COMPONENT_LOW = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_COMPONENT_LOW = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM sys_orefinger.component_low \nWHERE ${WHERE_COMPONENT_LOW(where)}`
export const INSERT_COMPONENT_LOW = (data: COLUMN[]) => ` INSERT INTO sys_orefinger.COMPONENT_LOW SET ${WHERE_COMPONENT_LOW(data)} `
export const UPDATE_COMPONENT_LOW = (data: COLUMN[]) => ` UPDATE sys_orefinger.COMPONENT_LOW SET ${WHERE_COMPONENT_LOW(data.filter(col=> !pk.includes(col)))}`
export const DELETE_COMPONENT_LOW = `DELETE FROM sys_orefinger.COMPONENT_LOW`

export interface COMPONENT_LOW {
    idx: number;		/* KEY(PRI) bigint - * */
    group_id: number;		/* KEY(MUL) bigint - * */
    component_id: number;		/* KEY(MUL) bigint - * */
    use_yn: string| null;		/*  varchar - * */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
    tag: string| null;		/*  varchar - 컨포넌트 그룹 명 */
}