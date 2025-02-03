/* AUTO CREATE TABLE INTERFACE :: 1738571724566 */
/* 환경변수 */
type COLUMN = 'code' | 'key' | 'value' | 'option_1' | 'option_2' | 'option_3' | 'option_4' | 'use_yn';
const columns : COLUMN[] = [ 'code','key','value','option_1','option_2','option_3','option_4','use_yn' ];
const pk : COLUMN[] = [ 'code','key' ];

export const ENV = 'env';
export const TABLE_COLUMNS_ENV = columns;
const WHERE_ENV = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_ENV = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.env \nWHERE ${WHERE_ENV(where)}`
export const INSERT_ENV = (data: COLUMN[]) => ` INSERT INTO discord.ENV SET ${WHERE_ENV(data)} `
export const UPDATE_ENV = (data: COLUMN[]) => ` UPDATE discord.ENV SET ${WHERE_ENV(data.filter(col=> !pk.includes(col)))}`
export const DELETE_ENV = ` DELETE FROM discord.ENV`

export interface ENV {
    code: string;		/* KEY(PRI) varchar - * */
    key: string;		/* KEY(PRI) varchar - * */
    value: string| null;		/*  varchar - * */
    option_1: string| null;		/*  varchar - * */
    option_2: string| null;		/*  varchar - * */
    option_3: string| null;		/*  varchar - * */
    option_4: string| null;		/*  varchar - * */
    use_yn: string| null;		/*  varchar - * */
}