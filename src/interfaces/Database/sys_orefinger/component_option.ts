/* AUTO CREATE TABLE INTERFACE :: 1738572455553 */
/* 컴포넌트 하위 옵션값 */
type COLUMN = 'option_id' | 'option_id' | 'option_id' | 'label' | 'label' | 'label_id' | 'value' | 'value' | 'value' | 'description' | 'description_id' | 'description' | 'emoji' | 'emoji' | 'emoji' | 'default_yn' | 'default_yn' | 'default_yn' | 'use_yn' | 'use_yn' | 'use_yn' | 'permission_type' | 'permission_type' | 'permission_type' | 'create_at' | 'create_at' | 'create_at' | 'update_at' | 'update_at' | 'update_at' | 'label_id' | 'label_id' | 'description_id' | 'description_id';
const columns : COLUMN[] = [ 'option_id','option_id','option_id','label','label','label_id','value','value','value','description','description_id','description','emoji','emoji','emoji','default_yn','default_yn','default_yn','use_yn','use_yn','use_yn','permission_type','permission_type','permission_type','create_at','create_at','create_at','update_at','update_at','update_at','label_id','label_id','description_id','description_id' ];
const pk : COLUMN[] = [ 'option_id','option_id','option_id' ];

export const COMPONENT_OPTION = 'component_option';
export const TABLE_COLUMNS_COMPONENT_OPTION = columns;
const WHERE_COMPONENT_OPTION = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_COMPONENT_OPTION = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM sys_orefinger.component_option \nWHERE ${WHERE_COMPONENT_OPTION(where)}`
export const INSERT_COMPONENT_OPTION = (data: COLUMN[]) => ` INSERT INTO sys_orefinger.COMPONENT_OPTION SET ${WHERE_COMPONENT_OPTION(data)} `
export const UPDATE_COMPONENT_OPTION = (data: COLUMN[]) => ` UPDATE sys_orefinger.COMPONENT_OPTION SET ${WHERE_COMPONENT_OPTION(data.filter(col=> !pk.includes(col)))}`
export const DELETE_COMPONENT_OPTION = `DELETE FROM sys_orefinger.COMPONENT_OPTION`

export interface COMPONENT_OPTION {
    option_id: number;		/* KEY(PRI) bigint - 컴포넌트 */
    label: string| null;		/*  varchar - * */
    label_id: number| null;		/* KEY(MUL) bigint - * */
    value: string| null;		/*  varchar - * */
    description: string| null;		/*  varchar - * */
    description_id: number| null;		/* KEY(MUL) bigint - * */
    emoji: string| null;		/*  varchar - * */
    default_yn: string| null;		/*  varchar - * */
    use_yn: string| null;		/*  varchar - * */
    permission_type: number| null;		/* KEY(MUL) int - * */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
}