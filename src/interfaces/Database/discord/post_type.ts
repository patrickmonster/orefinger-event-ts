/* AUTO CREATE TABLE INTERFACE :: 1738571726152 */
/*  */
type COLUMN = 'type_id' | 'type_id' | 'tag' | 'tag' | 'list_yn' | 'group_code' | 'icon' | 'group_code' | 'icon' | 'list_yn' | 'use_yn' | 'create_at' | 'update_at' | 'delete_at' | 'create_user' | 'update_user' | 'delete_user';
const columns : COLUMN[] = [ 'type_id','type_id','tag','tag','list_yn','group_code','icon','group_code','icon','list_yn','use_yn','create_at','update_at','delete_at','create_user','update_user','delete_user' ];
const pk : COLUMN[] = [ 'type_id','type_id' ];

export const POST_TYPE = 'post_type';
export const TABLE_COLUMNS_POST_TYPE = columns;
const WHERE_POST_TYPE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_POST_TYPE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.post_type \nWHERE ${WHERE_POST_TYPE(where)}`
export const INSERT_POST_TYPE = (data: COLUMN[]) => ` INSERT INTO discord.POST_TYPE SET ${WHERE_POST_TYPE(data)} `
export const UPDATE_POST_TYPE = (data: COLUMN[]) => ` UPDATE discord.POST_TYPE SET ${WHERE_POST_TYPE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_POST_TYPE = ` DELETE FROM discord.POST_TYPE`

export interface POST_TYPE {
    type_id: string;		/* KEY(PRI) varchar - * */
    tag: string| null;		/*  varchar - * */
    list_yn: string| null;		/*  char - 리스트 출력 여부 */
    group_code: string| null;		/* KEY(MUL) varchar - 리스트 그룹 */
    icon: string| null;		/*  varchar - 아이콘 Id */
    use_yn: string| null;		/*  char - 리스트 출력 여부 */
    create_at: Date| null;		/*  timestamp - * */
    update_at: Date| null;		/*  timestamp - * */
    delete_at: Date| null;		/*  timestamp - * */
    create_user: string| null;		/*  varchar - * */
    update_user: string| null;		/*  varchar - * */
    delete_user: string| null;		/*  varchar - * */
}