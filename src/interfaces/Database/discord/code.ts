/* AUTO CREATE TABLE INTERFACE :: 1738571723894 */
/*  */
type COLUMN = 'code' | 'value' | 'create_at' | 'code_1' | 'code_2' | 'code_3' | 'code_4' | 'code_5' | 'code_6' | 'use_yn' | 'show_yn' | 'order' | 'code_7' | 'code_8' | 'code_9' | 'code_10' | 'code_11' | 'code_12' | 'code_13' | 'code_14' | 'code_15';
const columns : COLUMN[] = [ 'code','value','create_at','code_1','code_2','code_3','code_4','code_5','code_6','use_yn','show_yn','order','code_7','code_8','code_9','code_10','code_11','code_12','code_13','code_14','code_15' ];
const pk : COLUMN[] = [ 'code','value' ];

export const CODE = 'code';
export const TABLE_COLUMNS_CODE = columns;
const WHERE_CODE = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_CODE = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.code \nWHERE ${WHERE_CODE(where)}`
export const INSERT_CODE = (data: COLUMN[]) => ` INSERT INTO discord.CODE SET ${WHERE_CODE(data)} `
export const UPDATE_CODE = (data: COLUMN[]) => ` UPDATE discord.CODE SET ${WHERE_CODE(data.filter(col=> !pk.includes(col)))}`
export const DELETE_CODE = ` DELETE FROM discord.CODE`

export interface CODE {
    code: string;		/* KEY(PRI) varchar - * */
    value: string;		/* KEY(PRI) varchar - * */
    create_at: Date;		/*  datetime - * */
    code_1: string| null;		/*  varchar - * */
    code_2: string| null;		/*  varchar - * */
    code_3: string| null;		/*  varchar - * */
    code_4: string| null;		/*  varchar - * */
    code_5: string| null;		/*  varchar - * */
    code_6: string| null;		/*  varchar - * */
    use_yn: string| null;		/*  varchar - * */
    show_yn: string| null;		/*  varchar - * */
    order: string| null;		/*  varchar - * */
    code_7: string| null;		/*  varchar - * */
    code_8: string| null;		/*  varchar - * */
    code_9: string| null;		/*  varchar - * */
    code_10: string| null;		/*  varchar - * */
    code_11: string| null;		/*  varchar - * */
    code_12: string| null;		/*  varchar - * */
    code_13: string| null;		/*  varchar - * */
    code_14: string| null;		/*  varchar - * */
    code_15: string| null;		/*  varchar - * */
}