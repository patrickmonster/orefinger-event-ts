/* AUTO CREATE TABLE INTERFACE :: 1738571722539 */
/* 업적 */
type COLUMN = 'idx' | 'create_at' | 'update_at' | 'name' | 'description' | 'use_yn';
const columns: COLUMN[] = ['idx', 'create_at', 'update_at', 'name', 'description', 'use_yn'];
const pk: COLUMN[] = ['idx'];

export const ACHIEVEMENTS = 'Achievements';
export const TABLE_COLUMNS_ACHIEVEMENTS = columns;
const WHERE_ACHIEVEMENTS = (where: COLUMN[]) => where.map(k => k + ' = ? ').join('\n	AND ');
export const SELECT_ACHIEVEMENTS = (where: COLUMN[], ignoreCols?: COLUMN[]) =>
    `SELECT ${columns
        .filter(col => !ignoreCols?.includes(col))
        .join('\n	, ')}FROM discord.Achievements \nWHERE ${WHERE_ACHIEVEMENTS(where)}`;
export const INSERT_ACHIEVEMENTS = (data: COLUMN[]) =>
    ` INSERT INTO discord.ACHIEVEMENTS SET ${WHERE_ACHIEVEMENTS(data)} `;
export const UPDATE_ACHIEVEMENTS = (data: COLUMN[]) =>
    ` UPDATE discord.ACHIEVEMENTS SET ${WHERE_ACHIEVEMENTS(data.filter(col => !pk.includes(col)))}`;
export const DELETE_ACHIEVEMENTS = ` DELETE FROM discord.ACHIEVEMENTS`;

export interface ACHIEVEMENTS {
    idx: number /* KEY(PRI) bigint - * */;
    create_at: Date /*  timestamp - * */;
    update_at: Date /*  timestamp - * */;
    name: string | null /*  char - * */;
    description: string | null /*  varchar - * */;
    use_yn: string | null /*  varchar - * */;
}
