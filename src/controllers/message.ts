import { query, queryPaging, SqlInsertUpdate } from 'utils/database';

import { MessageCreate } from 'interfaces/message';

export const getMessageList = async (page: number) =>
    queryPaging(
        `
SELECT message_id, context_id, tag, tts_yn as tts, ephemeral_yn as ephemeral, create_at, update_at
FROM notification.message`,
        page
    );

export const createMessage = async (message: MessageCreate) => query(`INSERT INTO notification.message set ?`, message);

export const updateMessage = async (message_id: number, message: MessageCreate) =>
    query<SqlInsertUpdate>(
        `
UPDATE message
SET ?, update_at=CURRENT_TIMESTAMP
WHERE message_id=?`,
        message,
        message_id
    );
