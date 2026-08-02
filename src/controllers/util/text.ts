import { query } from 'utils/database';

import { APIEmbed } from 'discord-api-types/v10';

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
