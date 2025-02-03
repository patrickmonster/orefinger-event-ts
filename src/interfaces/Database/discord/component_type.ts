/* AUTO CREATE TABLE INTERFACE :: 1738571724268 */
/* 컴포넌트 코드 관리 */
type COLUMN = 'type_idx' | 'type_idx' | 'type_idx' | 'tag' | 'tag' | 'tag' | 'type' | 'type' | 'use_yn' | 'code' | 'code' | 'use_yn' | 'use_yn';
const columns : COLUMN[] = [ 'type_idx','type_idx','type_idx','tag','tag','tag','type','type','use_yn','code','code','use_yn','use_yn' ];
const pk : COLUMN[] = [ 'type_idx','type_idx','type_idx' ];

export const COMPONENT_TYPE = 'component_type';
export const TABLE_COLUMNS_COMPONENT_TYPE = columns;
const WHERE_COMPONENT_TYPE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_COMPONENT_TYPE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.component_type \nWHERE ${WHERE_COMPONENT_TYPE(where)}`
export const INSERT_COMPONENT_TYPE = (data: COLUMN[]) => ` INSERT INTO discord.COMPONENT_TYPE SET ${WHERE_COMPONENT_TYPE(data)} `
export const UPDATE_COMPONENT_TYPE = (data: COLUMN[]) => ` UPDATE discord.COMPONENT_TYPE SET ${WHERE_COMPONENT_TYPE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_COMPONENT_TYPE = ` DELETE FROM discord.COMPONENT_TYPE`

export interface COMPONENT_TYPE {
    type_idx: number;		/* KEY(PRI) int - * */
    tag: string| null;		/*  varchar - * */
    type: number| null;		/*  int - * */
    use_yn: string| null;		/*  char - 사용여부 ( 출력여부) */
    code: string| null;		/*  varchar - * */
}