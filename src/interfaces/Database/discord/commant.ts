/* AUTO CREATE TABLE INTERFACE :: 1738571723922 */
/*  */
type COLUMN = 'id' | 'id' | 'parent_id' | 'parent_id' | 'message' | 'message' | 'post_id' | 'post_id' | 'create_user' | 'create_user' | 'use_yn' | 'use_yn' | 'create_at' | 'create_at' | 'update_at' | 'update_at';
const columns : COLUMN[] = [ 'id','id','parent_id','parent_id','message','message','post_id','post_id','create_user','create_user','use_yn','use_yn','create_at','create_at','update_at','update_at' ];
const pk : COLUMN[] = [ 'id','id' ];

export const COMMANT = 'commant';
export const TABLE_COLUMNS_COMMANT = columns;
const WHERE_COMMANT = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_COMMANT = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.commant \nWHERE ${WHERE_COMMANT(where)}`
export const INSERT_COMMANT = (data: COLUMN[]) => ` INSERT INTO discord.COMMANT SET ${WHERE_COMMANT(data)} `
export const UPDATE_COMMANT = (data: COLUMN[]) => ` UPDATE discord.COMMANT SET ${WHERE_COMMANT(data.filter(col=> !pk.includes(col)))}`
export const DELETE_COMMANT = ` DELETE FROM discord.COMMANT`

export interface COMMANT {
    id: number;		/* KEY(PRI) bigint - * */
    parent_id: number| null;		/* KEY(MUL) bigint - * */
    message: any| null;		/*  tinytext - * */
    post_id: number;		/* KEY(MUL) bigint - * */
    create_user: string| null;		/* KEY(MUL) varchar - * */
    use_yn: string| null;		/*  char - * */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
}