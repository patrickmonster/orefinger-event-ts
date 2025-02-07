/* AUTO CREATE TABLE INTERFACE :: 1738572455582 */
/* 옵션 - 컴포넌트 관계 */
type COLUMN = 'component_id' | 'component_id' | 'component_id' | 'option_id' | 'option_id' | 'option_id' | 'use_yn' | 'use_yn' | 'use_yn' | 'create_at' | 'create_at' | 'create_at' | 'update_at' | 'update_at' | 'update_at';
const columns : COLUMN[] = [ 'component_id','component_id','component_id','option_id','option_id','option_id','use_yn','use_yn','use_yn','create_at','create_at','create_at','update_at','update_at','update_at' ];
const pk : COLUMN[] = [ 'component_id','component_id','component_id','option_id','option_id','option_id' ];

export const COMPONENT_OPTION_CONNECTION = 'component_option_connection';
export const TABLE_COLUMNS_COMPONENT_OPTION_CONNECTION = columns;
const WHERE_COMPONENT_OPTION_CONNECTION = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_COMPONENT_OPTION_CONNECTION = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM sys_orefinger.component_option_connection \nWHERE ${WHERE_COMPONENT_OPTION_CONNECTION(where)}`
export const INSERT_COMPONENT_OPTION_CONNECTION = (data: COLUMN[]) => ` INSERT INTO sys_orefinger.COMPONENT_OPTION_CONNECTION SET ${WHERE_COMPONENT_OPTION_CONNECTION(data)} `
export const UPDATE_COMPONENT_OPTION_CONNECTION = (data: COLUMN[]) => ` UPDATE sys_orefinger.COMPONENT_OPTION_CONNECTION SET ${WHERE_COMPONENT_OPTION_CONNECTION(data.filter(col=> !pk.includes(col)))}`
export const DELETE_COMPONENT_OPTION_CONNECTION = `DELETE FROM sys_orefinger.COMPONENT_OPTION_CONNECTION`

export interface COMPONENT_OPTION_CONNECTION {
    component_id: number;		/* KEY(PRI) bigint - * */
    option_id: number;		/* KEY(PRI) bigint - 옵션 */
    use_yn: string| null;		/*  varchar - * */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
}