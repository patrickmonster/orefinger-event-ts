/* AUTO CREATE TABLE INTERFACE :: 1738571724227 */
/* 컴포넌트 스타일 */
type COLUMN = 'style_idx' | 'style_idx' | 'style_id' | 'tag' | 'tag' | 'tag' | 'use_yn' | 'use_yn';
const columns : COLUMN[] = [ 'style_idx','style_idx','style_id','tag','tag','tag','use_yn','use_yn' ];
const pk : COLUMN[] = [ 'style_idx','style_idx','style_id' ];

export const COMPONENT_STYLE = 'component_style';
export const TABLE_COLUMNS_COMPONENT_STYLE = columns;
const WHERE_COMPONENT_STYLE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_COMPONENT_STYLE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.component_style \nWHERE ${WHERE_COMPONENT_STYLE(where)}`
export const INSERT_COMPONENT_STYLE = (data: COLUMN[]) => ` INSERT INTO discord.COMPONENT_STYLE SET ${WHERE_COMPONENT_STYLE(data)} `
export const UPDATE_COMPONENT_STYLE = (data: COLUMN[]) => ` UPDATE discord.COMPONENT_STYLE SET ${WHERE_COMPONENT_STYLE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_COMPONENT_STYLE = ` DELETE FROM discord.COMPONENT_STYLE`

export interface COMPONENT_STYLE {
    style_idx: number;		/* KEY(PRI) int - * */
    style_id: number;		/* KEY(PRI) int - * */
    tag: string| null;		/*  varchar - * */
    use_yn: string| null;		/*  varchar - * */
}