/* AUTO CREATE TABLE INTERFACE :: 1738571722826 */
/* AUTH 테이블과 AUTH_TOKEN테이블을 연결함
-> 파티셔닝 이슈로 중복값 탐색이 불가능
-> 함수를 통해 AUTH_TOKEN에 넣기전, 선행으로 해당 테이블을 통해 값의 무결성 여부를 확인해야 함. */
type COLUMN = 'auth_id' | 'type' | 'user_id';
const columns : COLUMN[] = [ 'auth_id','type','user_id' ];
const pk : COLUMN[] = [ 'auth_id','type','user_id' ];

export const AUTH_CONNTECTION = 'auth_conntection';
export const TABLE_COLUMNS_AUTH_CONNTECTION = columns;
const WHERE_AUTH_CONNTECTION = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_AUTH_CONNTECTION = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.auth_conntection \nWHERE ${WHERE_AUTH_CONNTECTION(where)}`
export const INSERT_AUTH_CONNTECTION = (data: COLUMN[]) => ` INSERT INTO discord.AUTH_CONNTECTION SET ${WHERE_AUTH_CONNTECTION(data)} `
export const UPDATE_AUTH_CONNTECTION = (data: COLUMN[]) => ` UPDATE discord.AUTH_CONNTECTION SET ${WHERE_AUTH_CONNTECTION(data.filter(col=> !pk.includes(col)))}`
export const DELETE_AUTH_CONNTECTION = ` UPDATE discord.AUTH_CONNTECTION SET use_yn = 'N'`

export interface AUTH_CONNTECTION {
    auth_id: string;		/* KEY(PRI) char - 인증테이블의 사용자 */
    type: number;		/* KEY(PRI) int - 타입 */
    user_id: string;		/* KEY(PRI) varchar - 고유 id\n */
}