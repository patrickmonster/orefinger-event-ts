/* AUTO CREATE TABLE INTERFACE :: 1738571726557 */
/* 타입을 설정함
key
1 :인증관련
2 : 디스코드  컴포넌트 타입
3 : 훅 수신 이벤트
4 : 디스코드 웹훅타입
5 : 트수인증 타입
6 : 디스코드 채널 타입
7 : 인증사용자의 타입 (auth_token)
8 : 노래 종류
9 : 언어 */
type COLUMN = 'idx' | 'tag' | 'key' | 'value' | 'create_at' | 'update_at';
const columns : COLUMN[] = [ 'idx','tag','key','value','create_at','update_at' ];
const pk : COLUMN[] = [ 'idx' ];

export const TYPES = 'types';
export const TABLE_COLUMNS_TYPES = columns;
const WHERE_TYPES = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_TYPES = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.types \nWHERE ${WHERE_TYPES(where)}`
export const INSERT_TYPES = (data: COLUMN[]) => ` INSERT INTO discord.TYPES SET ${WHERE_TYPES(data)} `
export const UPDATE_TYPES = (data: COLUMN[]) => ` UPDATE discord.TYPES SET ${WHERE_TYPES(data.filter(col=> !pk.includes(col)))}`
export const DELETE_TYPES = ` UPDATE discord.TYPES SET use_yn = 'N'`

export interface TYPES {
    idx: number;		/* KEY(PRI) int - * */
    tag: string| null;		/*  varchar - 메모 */
    key: number;		/* KEY(MUL) int - 구분키 */
    value: string;		/*  varchar - * */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
}