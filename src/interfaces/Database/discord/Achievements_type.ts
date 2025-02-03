/* AUTO CREATE TABLE INTERFACE :: 1738571722569 */
/* 업적 타입 */
type COLUMN = 'type_idx' | 'name';
const columns : COLUMN[] = [ 'type_idx','name' ];
const pk : COLUMN[] = [ 'type_idx' ];

export const ACHIEVEMENTS_TYPE = 'Achievements_type';
export const TABLE_COLUMNS_ACHIEVEMENTS_TYPE = columns;
const WHERE_ACHIEVEMENTS_TYPE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_ACHIEVEMENTS_TYPE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.Achievements_type \nWHERE ${WHERE_ACHIEVEMENTS_TYPE(where)}`
export const INSERT_ACHIEVEMENTS_TYPE = (data: COLUMN[]) => ` INSERT INTO discord.ACHIEVEMENTS_TYPE SET ${WHERE_ACHIEVEMENTS_TYPE(data)} `
export const UPDATE_ACHIEVEMENTS_TYPE = (data: COLUMN[]) => ` UPDATE discord.ACHIEVEMENTS_TYPE SET ${WHERE_ACHIEVEMENTS_TYPE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_ACHIEVEMENTS_TYPE = ` UPDATE discord.ACHIEVEMENTS_TYPE SET use_yn = 'N'`

export interface ACHIEVEMENTS_TYPE {
    type_idx: number;		/* KEY(PRI) bigint - * */
    name: string| null;		/*  varchar - * */
}