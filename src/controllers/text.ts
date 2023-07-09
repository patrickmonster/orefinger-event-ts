import { query, queryPaging } from 'utils/database';

import { TextCreate } from 'interfaces/text';

export const getTextList = async (page: number) =>
    queryPaging(
        `
SELECT text_id, tag, message, create_at, update_at
FROM text_message
    `,
        page
    );

export const createText = async (text: TextCreate) => query(`INSERT INTO text_message set ?`, text);

export const updateText = async (text_id: number, text: TextCreate) =>
    query(
        `
UPDATE text_message
SET ?, update_at=CURRENT_TIMESTAMP
WHERE text_id=?`,
        text,
        text_id
    );
