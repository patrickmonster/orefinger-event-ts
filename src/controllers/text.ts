import { query, selectPaging, SqlInsertUpdate } from 'utils/database';

import { TextCreate } from 'interfaces/text';

export const getTextList = async (page: number, tag: string | undefined, message: string | undefined) =>
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
${tag ? '' : '-- '}AND tag LIKE CONCAT('%', ?, '%')
${message ? '' : '-- '}AND message LIKE CONCAT('%', ?, '%')
    `,
        page,
        tag,
        message
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
