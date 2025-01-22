import { calTo, query, selectPaging, SqlInsertUpdate } from 'utils/database';

import { APIEmbed } from 'discord-api-types/v10';
import { Paging } from 'interfaces/swagger';
import { TextCreate } from 'interfaces/text';

type TextListProps = {
    tag?: string;
    message?: string;
};

export const getTextList = async (page: Paging, props: TextListProps) =>
    selectPaging<{
        text_id: number;
        tag: string;
        message: string;
        create_at: string;
        update_at: string;
    }>(
        `
SELECT text_id, tag, message, create_at, update_at
FROM text_message
WHERE 1=1
${calTo("AND tag LIKE CONCAT('%', ?, '%')", props.tag)}
${calTo("AND message LIKE CONCAT('%', ?, '%')", props.message)}
    `,
        page
    );

export const createText = async (text: TextCreate) => query(`INSERT INTO text_message set ?`, text);

export const updateText = async (text_id: number, text: TextCreate) =>
    query<SqlInsertUpdate>(
        `
UPDATE text_message
SET ?, update_at=CURRENT_TIMESTAMP
WHERE text_id=?`,
        text,
        text_id
    );

//////////////////////////////////////////////////////////////////////////////////////////////////////

export const getTextDtil = async (text_id: number) =>
    query<{
        parent_id: string;
        tag: string;
        original_message: string;
        text_id: string;
        localizations: string;
        message: string;
        create_at: string;
        update_at: string;
    }>(
        `
WITH v_text AS (
    SELECT text_id, tag, message
    FROM text_message tm
    WHERE 1=1
    AND tm.text_id = 1
) 
SELECT tm2.parent_id, vt.tag, vt.message AS original_message
    , tm2.text_id, tm2.localizations, tm2.message, tm2.create_at, tm2.update_at 
FROM v_text vt
LEFT JOIN text_message tm2 ON vt.text_id = tm2.parent_id  
          
        `,
        text_id
    );

export const getTextDtilByEmbeds = async (text_id: number | string) =>
    query<{ embed: APIEmbed }>(
        `
SELECT JSON_OBJECT(
        'title', IFNULL(max(vt.tag), 'title' ),
        'description', CONCAT('ORIGIN] ', vt.message ,IFNULL(GROUP_CONCAT(CONCAT(tm2.localizations, '] ', tm2.message) SEPARATOR '\n'), '')) ,
        'timestamp', vt.create_at 
    ) AS embed
FROM (
    SELECT text_id, tag, message, create_at 
    FROM text_message tm
    WHERE 1=1
    AND tm.text_id = ?
) vt
LEFT JOIN text_message tm2 ON vt.text_id = tm2.parent_id  
        `,
        text_id
    ).then(list => list[0]?.embed);
