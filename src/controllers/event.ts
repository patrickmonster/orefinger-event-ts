'use strict';
import { query, SqlInsertUpdate } from 'utils/database';

export const channel = async (channel_id: string, webhook_id: string) => {
    query<{
        type: number;
        channel_id: string;
        custom_ment: string;
    }>(
        `
select \`type\`, channel_id, custom_ment
from event_channel ec 
where \`type\` = 14
and (hook_id = ? or channel_id  = ? ) -- 채널 or 훅 ID 일치 (훅이 아닌 채널일 경우)
union
select \`type\`, token as channel_id, JSON_UNQUOTE(json_extract(ei.data, '$.ment')) as custom_ment
from event_id ei 
where \`type\` = 52
and token = ? -- 채널 id`,
        webhook_id,
        webhook_id,
        channel_id
    );
};

export const webhook = async (webhook_id: string) =>
    query<{
        user_id: string;
        hook_id: string;
        hook_token: string;
    }>(
        `
select user_id, hook_id, hook_token
from event_channel ec 
where \`type\` = 14
and hook_id = ?`,
        webhook_id
    );
