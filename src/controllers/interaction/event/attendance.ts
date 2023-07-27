'use strict';
import { query, queryPaging, SqlInsertUpdate } from 'utils/database';
import { AuthUser } from 'interfaces/auth';

import { EventSub, Event, Subscription } from 'interfaces/eventsub';

export const getAdvertisement = async (game_id: number) => {
    query<{
        advertisement_id: number;
        embed: string;
    }>(
        `
select advertisement_id, embed 
from v_advertisement va
inner join (
    select func_advert(?) as advertisement_id
) b using(advertisement_id)
    `,
        game_id
    );
};

export const attendance = async (author_id: string, user_id: string) =>
    query<SqlInsertUpdate>(
        `
INSERT ignore INTO discord.attendance (\`type\`, yymm, auth_id, event_id)
select \`type\`
    , DATE_FORMAT( now(), '%y%m')
    , ? as auth_id
    , event_id
from (
    SELECT *
    FROM discord.event_live
    where auth_id = ?
    and event_id is not null
) eo
    `,
        author_id,
        user_id
    ).then(row => row.insertId || row.affectedRows);
