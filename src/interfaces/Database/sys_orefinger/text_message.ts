/* AUTO CREATE TABLE INTERFACE :: 1738572455873 */
/* 전송용 메세지

lang_type = 9 */
type COLUMN = 'text_id' | 'text_id' | 'text_id' | 'parent_id' | 'language_cd' | 'tag' | 'message' | 'name' | 'localizations' | 'create_at' | 'tag' | 'text' | 'update_at' | 'message' | 'create_at' | 'create_at' | 'update_at' | 'update_at';
const columns : COLUMN[] = [ 'text_id','text_id','text_id','parent_id','language_cd','tag','message','name','localizations','create_at','tag','text','update_at','message','create_at','create_at','update_at','update_at' ];
const pk : COLUMN[] = [ 'text_id','text_id','text_id' ];

export const TEXT_MESSAGE = 'text_message';
export const TABLE_COLUMNS_TEXT_MESSAGE = columns;
const WHERE_TEXT_MESSAGE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_TEXT_MESSAGE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM sys_orefinger.text_message \nWHERE ${WHERE_TEXT_MESSAGE(where)}`
export const INSERT_TEXT_MESSAGE = (data: COLUMN[]) => ` INSERT INTO sys_orefinger.TEXT_MESSAGE SET ${WHERE_TEXT_MESSAGE(data)} `
export const UPDATE_TEXT_MESSAGE = (data: COLUMN[]) => ` UPDATE sys_orefinger.TEXT_MESSAGE SET ${WHERE_TEXT_MESSAGE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_TEXT_MESSAGE = `UPDATE sys_orefinger.TEXT_MESSAGE SET use_yn = 'N'`

export interface TEXT_MESSAGE {
    text_id: number;		/* KEY(PRI) bigint - 인식값 */
    parent_id: number| null;		/* KEY(MUL) bigint - 인식값 */
    language_cd: number;		/*  int - * */
    tag: string| null;		/*  varchar - 코맨트 */
    message: any| null;		/*  mediumtext - 메세지 */
    name: string| null;		/*  varchar - 코맨트 */
    localizations: string| null;		/*  varchar - 언어 */
    create_at: Date| null;		/*  datetime - * */
    text: any| null;		/*  mediumtext - 메세지 */
    update_at: Date| null;		/*  datetime - * */
}