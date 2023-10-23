import { calTo, query, selectPaging, SqlInsertUpdate } from 'utils/database';

import { TextCreate } from 'interfaces/text';
import { Paging } from 'interfaces/swagger';

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
