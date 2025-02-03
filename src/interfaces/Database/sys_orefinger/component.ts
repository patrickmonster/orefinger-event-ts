/* AUTO CREATE TABLE INTERFACE :: 1738572455325 */
/* 컴포넌트 */
type COLUMN = 'component_id' | 'component_id' | 'component_id' | 'component_id' | 'name' | 'name' | 'component_group_id' | 'name' | 'label_id' | 'label' | 'component_urn' | 'label_id' | 'type_idx' | 'label_lang' | 'label_lang' | 'text_id' | 'type_idx' | 'type_idx' | 'style_id' | 'text_id' | 'text_id' | 'emoji' | 'emoji' | 'emoji' | 'custom_id' | 'custom_id' | 'custom_id' | 'value' | 'value' | 'value' | 'min_values' | 'style' | 'style_id' | 'min_values' | 'min_values' | 'max_values' | 'max_values' | 'max_values' | 'disabled_yn' | 'required_yn' | 'disabled_yn' | 'disabled_yn' | 'use_yn' | 'required_yn' | 'required_yn' | 'edit_yn' | 'use_yn' | 'use_yn' | 'edit_yn' | 'permission_type' | 'edit_yn' | 'permission_type' | 'permission_type' | 'create_at' | 'create_at' | 'create_at' | 'update_at' | 'update_at' | 'update_at' | 'order_by' | 'order_by' | 'order_by' | 'label_id' | 'style_id';
const columns : COLUMN[] = [ 'component_id','component_id','component_id','component_id','name','name','component_group_id','name','label_id','label','component_urn','label_id','type_idx','label_lang','label_lang','text_id','type_idx','type_idx','style_id','text_id','text_id','emoji','emoji','emoji','custom_id','custom_id','custom_id','value','value','value','min_values','style','style_id','min_values','min_values','max_values','max_values','max_values','disabled_yn','required_yn','disabled_yn','disabled_yn','use_yn','required_yn','required_yn','edit_yn','use_yn','use_yn','edit_yn','permission_type','edit_yn','permission_type','permission_type','create_at','create_at','create_at','update_at','update_at','update_at','order_by','order_by','order_by','label_id','style_id' ];
const pk : COLUMN[] = [ 'component_id','component_id','component_id','component_id' ];

export const COMPONENT = 'component';
export const TABLE_COLUMNS_COMPONENT = columns;
const WHERE_COMPONENT = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_COMPONENT = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM sys_orefinger.component \nWHERE ${WHERE_COMPONENT(where)}`
export const INSERT_COMPONENT = (data: COLUMN[]) => ` INSERT INTO sys_orefinger.COMPONENT SET ${WHERE_COMPONENT(data)} `
export const UPDATE_COMPONENT = (data: COLUMN[]) => ` UPDATE sys_orefinger.COMPONENT SET ${WHERE_COMPONENT(data.filter(col=> !pk.includes(col)))}`
export const DELETE_COMPONENT = `DELETE FROM sys_orefinger.COMPONENT`

export interface COMPONENT {
    component_id: number;		/* KEY(PRI) bigint - * */
    name: string| null;		/*  varchar - 설명 - 표기 */
    component_group_id: number;		/*  int - * */
    label_id: number| null;		/*  bigint - * */
    label: string| null;		/*  varchar - * */
    component_urn: string;		/*  text - * */
    type_idx: number| null;		/* KEY(MUL) int - 컴포넌트 타입\n */
    label_lang: number| null;		/*  bigint - * */
    text_id: number| null;		/* KEY(MUL) bigint - * */
    style_id: number| null;		/* KEY(MUL) int - * */
    emoji: string| null;		/*  varchar - * */
    custom_id: string| null;		/*  varchar - * */
    value: string| null;		/*  varchar - * */
    min_values: number| null;		/*  int - * */
    style: number| null;		/* KEY(MUL) int - * */
    max_values: number| null;		/*  int - * */
    disabled_yn: string| null;		/*  char - * */
    required_yn: string| null;		/*  char - * */
    use_yn: string| null;		/*  char - * */
    edit_yn: string| null;		/*  char - * */
    permission_type: number| null;		/* KEY(MUL) int - * */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
    order_by: number| null;		/*  int - * */
}