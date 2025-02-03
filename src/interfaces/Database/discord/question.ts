/* AUTO CREATE TABLE INTERFACE :: 1738571726350 */
/*  */
type COLUMN = 'idx' | 'channel_id' | 'user' | 'message' | 'img' | 'create_at' | 'update_at';
const columns : COLUMN[] = [ 'idx','channel_id','user','message','img','create_at','update_at' ];
const pk : COLUMN[] = [ 'idx' ];

export const QUESTION = 'question';
export const TABLE_COLUMNS_QUESTION = columns;
const WHERE_QUESTION = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_QUESTION = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.question \nWHERE ${WHERE_QUESTION(where)}`
export const INSERT_QUESTION = (data: COLUMN[]) => ` INSERT INTO discord.QUESTION SET ${WHERE_QUESTION(data)} `
export const UPDATE_QUESTION = (data: COLUMN[]) => ` UPDATE discord.QUESTION SET ${WHERE_QUESTION(data.filter(col=> !pk.includes(col)))}`
export const DELETE_QUESTION = ` UPDATE discord.QUESTION SET use_yn = 'N'`

export interface QUESTION {
    idx: number;		/* KEY(PRI) bigint - * */
    channel_id: string;		/* KEY(MUL) char - * */
    user: string;		/*  char - * */
    message: string;		/*  text - * */
    img: string;		/*  char - * */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
}