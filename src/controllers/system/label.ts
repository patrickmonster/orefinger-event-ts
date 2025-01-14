import { Paging } from 'interfaces/swagger';
import { BaseTableCols, calTo, query, selectPaging, SqlInsertUpdate } from 'utils/database';

export interface Label {
    name: string;
    language_cd: number;
    text: string;
}

export const findLabel = async (names: string[], language_cd?: number) =>
    query<Label & BaseTableCols>(
        `
SELECT
	name
	, language_cd
	, text
	, create_at
	, update_at
FROM sys_orefinger.label
WHERE 1=1
AND name IN (?)
AND language_cd = ?
        `,
        names,
        language_cd || 0 // KR
    );
export const selectLabel = async (page: Paging, { search, language_cd }: { search?: string; language_cd?: number }) =>
    selectPaging<Label & BaseTableCols>(
        `
SELECT
    name
    , language_cd
    , text
    , create_at
    , update_at
FROM sys_orefinger.label
WHERE 1=1
AND language_cd = ?
${calTo(`AND ( name = ? OR text = ? )`, search)}
    `,
        page,
        language_cd || 0 // KR
    );

export const upsertLabel = async (label: Label) =>
    query<SqlInsertUpdate>(`INSERT INTO sys_orefinger.label SET ? ON DUPLICATE KEY UPDATE ?`, label, {
        text: label.text,
    });
