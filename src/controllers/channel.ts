import { calTo, query } from 'utils/database';

type OnlineChannelsProps = {
    channels_id?: string[];
    user_id?: string;
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
${calTo('user_id = ?', user_id)}
${calTo('channel_id in (?)', channels_id)}`,
        user_id,
        channels_id
    );
