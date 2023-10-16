import { calTo, query, SqlInsertUpdate } from 'utils/database';

type OnlineChannelsProps = {
    user_id?: string;
    channels_id?: string[];
};

export const onlineChannels = ({ channels_id, user_id }: OnlineChannelsProps) =>
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
${calTo('and user_id = ?', user_id)}
${calTo('and channel_id in (?)', channels_id)}`
    );
