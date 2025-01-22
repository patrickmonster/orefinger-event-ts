import { Paging } from 'interfaces/swagger';
import { BaseTableCols, calLikeTo, calTo, objectToAndQury, query, selectPaging, SqlInsertUpdate } from 'utils/database';

export interface TextPk {
    text_id: number;
}

export interface Text {
    name: string;
    language_cd: number;
    text: string;
}

export const findText = async (names: string[], language_cd?: number) =>
    query<Text & BaseTableCols>(
        `
SELECT text_id
	, name
	, language_cd
	, text
	, create_at
	, update_at
FROM sys_orefinger.text_message
WHERE 1=1
AND name IN (?)
AND language_cd = ?
        `,
        names,
        language_cd || 0 // KR
    );

export const selectText = async (
    page: Paging,
    { name, text_id, language_cd }: { name?: string; text_id?: string; language_cd?: number }
) =>
    selectPaging<Text & BaseTableCols>(
        `
SELECT text_id
    , name
    , language_cd
    , text
    , create_at
    , update_at
FROM sys_orefinger.text_message
WHERE 1=1
AND language_cd = ?
${calTo(`AND text_id = ?`, text_id)}
${calLikeTo(`AND name LIKE ?`, name)}
    `,
        page,
        language_cd || 0 // KR
    );

export const upsertText = async (item: Text, pk?: TextPk) =>
    pk?.text_id
        ? query<SqlInsertUpdate>(`UPDATE sys_orefinger.text_message SET ? WHERE ?`, item, objectToAndQury(pk))
        : query<SqlInsertUpdate>(`INSERT INTO sys_orefinger.text_message SET ?`, item);
