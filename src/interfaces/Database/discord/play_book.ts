/* AUTO CREATE TABLE INTERFACE :: 1738571726004 */
/* 음악책 -> 재생책 */
type COLUMN = 'music_id' | 'register' | 'type' | 'title' | 'singer' | 'url' | 'subtitle' | 'memo' | 'use_yn' | 'creat_at';
const columns : COLUMN[] = [ 'music_id','register','type','title','singer','url','subtitle','memo','use_yn','creat_at' ];
const pk : COLUMN[] = [ 'music_id' ];

export const PLAY_BOOK = 'play_book';
export const TABLE_COLUMNS_PLAY_BOOK = columns;
const WHERE_PLAY_BOOK = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_PLAY_BOOK = (where: COLUMN[], ignoreCols?: COLUMN[]) => `SELECT ${columns.filter(col => !ignoreCols?.includes(col)).join('\n	, ')}FROM discord.play_book \nWHERE ${WHERE_PLAY_BOOK(where)}`
export const INSERT_PLAY_BOOK = (data: COLUMN[]) => ` INSERT INTO discord.PLAY_BOOK SET ${WHERE_PLAY_BOOK(data)} `
export const UPDATE_PLAY_BOOK = (data: COLUMN[]) => ` UPDATE discord.PLAY_BOOK SET ${WHERE_PLAY_BOOK(data.filter(col=> !pk.includes(col)))}`
export const DELETE_PLAY_BOOK = ` DELETE FROM discord.PLAY_BOOK`

export interface PLAY_BOOK {
    music_id: number;		/* KEY(PRI) bigint - * */
    register: string| null;		/*  varchar - 소유자 */
    type: number| null;		/* KEY(MUL) int - * */
    title: string| null;		/* KEY(MUL) char - 곡 제목 */
    singer: string| null;		/*  char - 가수 */
    url: string| null;		/*  text - url 링크 - 동영상 링크 */
    subtitle: any| null;		/*  mediumtext - 가사 => json(음악타이밍) / text(일반 스크롤) */
    memo: string| null;		/*  varchar - * */
    use_yn: string| null;		/*  char - 신청시 N */
    creat_at: Date| null;		/*  datetime - * */
}