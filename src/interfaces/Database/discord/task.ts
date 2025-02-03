/* AUTO CREATE TABLE INTERFACE :: 1738571726467 */
/* ECS 테스크 정보 */
type COLUMN = 'idx' | 'id' | 'revision' | 'family' | 'last_ping' | 'create_at';
const columns : COLUMN[] = [ 'idx','id','revision','family','last_ping','create_at' ];
const pk : COLUMN[] = [ 'idx' ];

export const TASK = 'task';
export const TABLE_COLUMNS_TASK = columns;
const WHERE_TASK = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_TASK = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.task \nWHERE ${WHERE_TASK(where)}`
export const INSERT_TASK = (data: COLUMN[]) => ` INSERT INTO discord.TASK SET ${WHERE_TASK(data)} `
export const UPDATE_TASK = (data: COLUMN[]) => ` UPDATE discord.TASK SET ${WHERE_TASK(data.filter(col=> !pk.includes(col)))}`
export const DELETE_TASK = ` UPDATE discord.TASK SET use_yn = 'N'`

export interface TASK {
    idx: number;		/* KEY(PRI) bigint - 순서 (task id) */
    id: string;		/*  varchar - * */
    revision: number| null;		/* KEY(MUL) int - * */
    family: string| null;		/*  varchar - * */
    last_ping: Date| null;		/*  datetime - 마지막 호출 */
    create_at: Date| null;		/*  timestamp - 생성시간 */
}