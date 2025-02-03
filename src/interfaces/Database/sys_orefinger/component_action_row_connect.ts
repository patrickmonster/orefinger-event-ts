/* AUTO CREATE TABLE INTERFACE :: 1738572455390 */
/* 컴포넌트 ACTION_ROW */
type COLUMN = 'component_row_id' | 'component_row_id' | 'component_id' | 'component_id' | 'sort_number' | 'sort_number' | 'use_yn' | 'use_yn' | 'create_at' | 'create_at' | 'update_at' | 'update_at';
const columns : COLUMN[] = [ 'component_row_id','component_row_id','component_id','component_id','sort_number','sort_number','use_yn','use_yn','create_at','create_at','update_at','update_at' ];
const pk : COLUMN[] = [ 'component_row_id','component_row_id','component_id','component_id' ];

export const COMPONENT_ACTION_ROW_CONNECT = 'component_action_row_connect';
export const TABLE_COLUMNS_COMPONENT_ACTION_ROW_CONNECT = columns;
const WHERE_COMPONENT_ACTION_ROW_CONNECT = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_COMPONENT_ACTION_ROW_CONNECT = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM sys_orefinger.component_action_row_connect \nWHERE ${WHERE_COMPONENT_ACTION_ROW_CONNECT(where)}`
export const INSERT_COMPONENT_ACTION_ROW_CONNECT = (data: COLUMN[]) => ` INSERT INTO sys_orefinger.COMPONENT_ACTION_ROW_CONNECT SET ${WHERE_COMPONENT_ACTION_ROW_CONNECT(data)} `
export const UPDATE_COMPONENT_ACTION_ROW_CONNECT = (data: COLUMN[]) => ` UPDATE sys_orefinger.COMPONENT_ACTION_ROW_CONNECT SET ${WHERE_COMPONENT_ACTION_ROW_CONNECT(data.filter(col=> !pk.includes(col)))}`
export const DELETE_COMPONENT_ACTION_ROW_CONNECT = `DELETE FROM sys_orefinger.COMPONENT_ACTION_ROW_CONNECT`

export interface COMPONENT_ACTION_ROW_CONNECT {
    component_row_id: number;		/* KEY(PRI) bigint - * */
    component_id: number;		/* KEY(PRI) bigint - * */
    sort_number: number| null;		/*  int - * */
    use_yn: string| null;		/*  varchar - * */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
}