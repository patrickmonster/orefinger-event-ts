import { query, queryPaging, SqlInsertUpdate } from 'utils/database';

import { EmbedCreate } from 'interfaces/embed';

export const getEmbedList = async (page: number) =>
    queryPaging(
        `
select *
from v_embed`,
        page
    );

export const createEmbed = async (message: EmbedCreate) => query(`INSERT INTO embed set ?`, message);

export const updateEmbed = async (embed_id: number, message: EmbedCreate) =>
    query<SqlInsertUpdate>(
        `
UPDATE embed
SET ?, update_at=CURRENT_TIMESTAMP
WHERE embed_id=?`,
        message,
        embed_id
    );
