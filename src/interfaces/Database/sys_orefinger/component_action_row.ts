/* AUTO CREATE TABLE INTERFACE :: 1738572455356 */
/* 컴포넌트 ACTION_ROW */
type COLUMN = 'component_id' | 'component_id' | 'name' | 'name' | 'create_at' | 'create_at' | 'update_at' | 'update_at' | 'sort_number' | 'sort_number';
const columns : COLUMN[] = [ 'component_id','component_id','name','name','create_at','create_at','update_at','update_at','sort_number','sort_number' ];
const pk : COLUMN[] = [ 'component_id','component_id' ];

export const COMPONENT_ACTION_ROW = 'component_action_row';
export const TABLE_COLUMNS_COMPONENT_ACTION_ROW = columns;
const WHERE_COMPONENT_ACTION_ROW = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_COMPONENT_ACTION_ROW = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM sys_orefinger.component_action_row \nWHERE ${WHERE_COMPONENT_ACTION_ROW(where)}`
export const INSERT_COMPONENT_ACTION_ROW = (data: COLUMN[]) => ` INSERT INTO sys_orefinger.COMPONENT_ACTION_ROW SET ${WHERE_COMPONENT_ACTION_ROW(data)} `
export const UPDATE_COMPONENT_ACTION_ROW = (data: COLUMN[]) => ` UPDATE sys_orefinger.COMPONENT_ACTION_ROW SET ${WHERE_COMPONENT_ACTION_ROW(data.filter(col=> !pk.includes(col)))}`
export const DELETE_COMPONENT_ACTION_ROW = `UPDATE sys_orefinger.COMPONENT_ACTION_ROW SET use_yn = 'N'`

export interface COMPONENT_ACTION_ROW {
    component_id: number;		/* KEY(PRI) bigint - * */
    name: string| null;		/*  varchar - * */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
    sort_number: number| null;		/*  int - * */
}