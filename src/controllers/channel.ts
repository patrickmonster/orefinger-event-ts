import { query, queryPaging, SqlInsertUpdate } from 'utils/database';

export const onlineChannels = (user_id: string, channels_id: string[]) =>
    query<{
        type: number;
        user_id: string;
        name: string;
        channel_id: string;
        custom_ment: string;
        url: string;
        create_at: string;
        update_at: string;
    }>(
        `
select \`type\`, user_id, name, channel_id, custom_ment, url, create_at, update_at 
from v_event_channel vec 
where 1=1
and user_id = ? 
and channel_id in (?)`,
        user_id,
        channels_id
    );
