/* AUTO CREATE TABLE INTERFACE :: 1738571725105 */
/* 링크 카운터 테이블 (히스토리) */
type COLUMN = 'hash_id' | 'id' | 'label' | 'target_url' | 'create_at' | 'update_at';
const columns : COLUMN[] = [ 'hash_id','id','label','target_url','create_at','update_at' ];
const pk : COLUMN[] = [ 'id' ];

export const LINK_TARGET = 'link_target';
export const TABLE_COLUMNS_LINK_TARGET = columns;
const WHERE_LINK_TARGET = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_LINK_TARGET = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.link_target \nWHERE ${WHERE_LINK_TARGET(where)}`
export const INSERT_LINK_TARGET = (data: COLUMN[]) => ` INSERT INTO discord.LINK_TARGET SET ${WHERE_LINK_TARGET(data)} `
export const UPDATE_LINK_TARGET = (data: COLUMN[]) => ` UPDATE discord.LINK_TARGET SET ${WHERE_LINK_TARGET(data.filter(col=> !pk.includes(col)))}`
export const DELETE_LINK_TARGET = ` UPDATE discord.LINK_TARGET SET use_yn = 'N'`

export interface LINK_TARGET {
    hash_id: string| null;		/*  varchar - * */
    id: number;		/* KEY(PRI) bigint - * */
    label: string| null;		/*  char - * */
    target_url: string;		/*  text - * */
    create_at: Date;		/*  timestamp - * */
    update_at: Date;		/*  timestamp - * */
}