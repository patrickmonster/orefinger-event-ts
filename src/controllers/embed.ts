import { query, selectPaging, SqlInsertUpdate } from 'utils/database';

import { APIEmbed } from 'discord-api-types/v10';
import { EmbedCreate } from 'interfaces/embed';

export const selectEmbedList = async (page: number) =>
    selectPaging<{
        embed_id: number;
        tag: string;
        url: string;
        color: number;
        image: string;
        thumbnail: string;
        title: string;
        description: string;
        provider: string;
        author: string;
        create_at: string;
        update_at: string;
    }>(
        `
select *
from v_embed
        `,
        page
    );

export const selectEmbedDtilByEmbed = async (embed_id: number | string) =>
    query<{ embed: APIEmbed; content: string }>(
        `
SELECT func_get_embed(e.embed_id) AS embed 
    , CONCAT('embed : ' ,IFnull(tag, '지정되지 않음'), ' - ',e.embed_id) AS content
FROM embed e 
WHERE e.embed_id = ?
        `,
        embed_id
    ).then(res => res[0]);

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
