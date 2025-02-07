/* AUTO CREATE TABLE INTERFACE :: 1738571726089 */
/*  */
type COLUMN = 'id' | 'id' | 'title' | 'title' | 'description' | 'description' | 'type' | 'type' | 'use_yn' | 'use_yn' | 'public_yn' | 'public_yn' | 'commant_yn' | 'commant_yn' | 'create_at' | 'create_at' | 'update_at' | 'update_at' | 'delete_at' | 'delete_at' | 'create_user' | 'create_user' | 'update_user' | 'update_user' | 'delete_user' | 'delete_user' | 'password' | 'password';
const columns : COLUMN[] = [ 'id','id','title','title','description','description','type','type','use_yn','use_yn','public_yn','public_yn','commant_yn','commant_yn','create_at','create_at','update_at','update_at','delete_at','delete_at','create_user','create_user','update_user','update_user','delete_user','delete_user','password','password' ];
const pk : COLUMN[] = [ 'id','id' ];

export const POST = 'post';
export const TABLE_COLUMNS_POST = columns;
const WHERE_POST = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_POST = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.post \nWHERE ${WHERE_POST(where)}`
export const INSERT_POST = (data: COLUMN[]) => ` INSERT INTO discord.POST SET ${WHERE_POST(data)} `
export const UPDATE_POST = (data: COLUMN[]) => ` UPDATE discord.POST SET ${WHERE_POST(data.filter(col=> !pk.includes(col)))}`
export const DELETE_POST = ` DELETE FROM discord.POST`

export interface POST {
    id: number;		/* KEY(PRI) bigint - * */
    title: string| null;		/*  varchar - * */
    description: any| null;		/*  mediumtext - * */
    type: string| null;		/*  varchar - * */
    use_yn: string| null;		/*  char - * */
    public_yn: string| null;		/*  char - * */
    commant_yn: string| null;		/*  char - * */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
    delete_at: Date| null;		/*  timestamp - * */
    create_user: string| null;		/*  varchar - * */
    update_user: string| null;		/*  varchar - * */
    delete_user: string| null;		/*  varchar - * */
    password: string| null;		/*  varchar - * */
}