/* AUTO CREATE TABLE INTERFACE :: 1738571725157 */
/* 맨션 */
type COLUMN = 'mansion_idx';
const columns : COLUMN[] = [ 'mansion_idx' ];
const pk : COLUMN[] = [ 'mansion_idx' ];

export const MANSION = 'mansion';
export const TABLE_COLUMNS_MANSION = columns;
const WHERE_MANSION = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_MANSION = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.mansion \nWHERE ${WHERE_MANSION(where)}`
export const INSERT_MANSION = (data: COLUMN[]) => ` INSERT INTO discord.MANSION SET ${WHERE_MANSION(data)} `
export const UPDATE_MANSION = (data: COLUMN[]) => ` UPDATE discord.MANSION SET ${WHERE_MANSION(data.filter(col=> !pk.includes(col)))}`
export const DELETE_MANSION = ` UPDATE discord.MANSION SET use_yn = 'N'`

export interface MANSION {
    mansion_idx: number;		/* KEY(PRI) bigint - * */
}