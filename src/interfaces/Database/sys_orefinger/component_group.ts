/* AUTO CREATE TABLE INTERFACE :: 1738572455481 */
/*  */
type COLUMN = 'group_id' | 'group_id' | 'group_id' | 'name' | 'name' | 'name' | 'group_type' | 'group_type' | 'group_type' | 'type_idx' | 'type_idx' | 'type_idx' | 'create_at' | 'create_at' | 'create_at' | 'update_at' | 'update_at' | 'update_at';
const columns : COLUMN[] = [ 'group_id','group_id','group_id','name','name','name','group_type','group_type','group_type','type_idx','type_idx','type_idx','create_at','create_at','create_at','update_at','update_at','update_at' ];
const pk : COLUMN[] = [ 'group_id','group_id','group_id' ];

export const COMPONENT_GROUP = 'component_group';
export const TABLE_COLUMNS_COMPONENT_GROUP = columns;
const WHERE_COMPONENT_GROUP = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_COMPONENT_GROUP = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM sys_orefinger.component_group \nWHERE ${WHERE_COMPONENT_GROUP(where)}`
export const INSERT_COMPONENT_GROUP = (data: COLUMN[]) => ` INSERT INTO sys_orefinger.COMPONENT_GROUP SET ${WHERE_COMPONENT_GROUP(data)} `
export const UPDATE_COMPONENT_GROUP = (data: COLUMN[]) => ` UPDATE sys_orefinger.COMPONENT_GROUP SET ${WHERE_COMPONENT_GROUP(data.filter(col=> !pk.includes(col)))}`
export const DELETE_COMPONENT_GROUP = `UPDATE sys_orefinger.COMPONENT_GROUP SET use_yn = 'N'`

export interface COMPONENT_GROUP {
    group_id: number;		/* KEY(PRI) bigint - * */
    name: string| null;		/*  varchar - * */
    group_type: string| null;		/* KEY(MUL) varchar - * */
    type_idx: number;		/* KEY(MUL) int - 컴포넌트 타입 : 2 */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
}