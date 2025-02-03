/* AUTO CREATE TABLE INTERFACE :: 1738571723312 */
/* 역할 타입
- 사용하지 않음 */
type COLUMN = 'idx' | 'tag';
const columns : COLUMN[] = [ 'idx','tag' ];
const pk : COLUMN[] = [ 'idx' ];

export const AUTH_RULE_TYPE = 'auth_rule_type';
export const TABLE_COLUMNS_AUTH_RULE_TYPE = columns;
const WHERE_AUTH_RULE_TYPE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_AUTH_RULE_TYPE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.auth_rule_type \nWHERE ${WHERE_AUTH_RULE_TYPE(where)}`
export const INSERT_AUTH_RULE_TYPE = (data: COLUMN[]) => ` INSERT INTO discord.AUTH_RULE_TYPE SET ${WHERE_AUTH_RULE_TYPE(data)} `
export const UPDATE_AUTH_RULE_TYPE = (data: COLUMN[]) => ` UPDATE discord.AUTH_RULE_TYPE SET ${WHERE_AUTH_RULE_TYPE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_AUTH_RULE_TYPE = ` UPDATE discord.AUTH_RULE_TYPE SET use_yn = 'N'`

export interface AUTH_RULE_TYPE {
    idx: number;		/* KEY(PRI) int - * */
    tag: string| null;		/*  varchar - * */
}