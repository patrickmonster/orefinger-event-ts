import getConnection, { query, SqlInsertUpdate, format, calTo } from 'utils/database';

import { webhook as webhookUpdateType } from 'interfaces/webhook';
import { deleteObjectColByKey } from 'utils/object';
import { userIds } from './auth';

export type webhookType = {
    type: number;
    tag: string;
    user_id: string;
    custom_name: string;
    channel_id: string;
    guild_id: string;
    custom_ment: string;
    hook_id: string;
    hook_token: string;
    login: string;
    name: string;
    kr_name: string;
    avatar: string;
    avatar_id: string;
    create_at: string;
    update_at: string;
};

export const webhook = async (auth_id: string, type?: number) =>
    query<webhookType>(
        `
select ec.type
	, t.tag 
    , ec.user_id, ec.name as custom_name, ec.channel_id, ec.guild_id, ec.custom_ment, ec.hook_id, ec.hook_token
	, vat.user_id, vat.login, vat.name, vat.kr_name, vat.avatar, vat.avatar_id, ec.create_at, ec.update_at 
from event_channel ec
inner join v_auth_token vat  on vat.user_id  = ec.user_id and vat.type = 2        
left join types t on t.idx = ec.type
where 1=1
${calTo('AND ec.type = ?', type)}
and vat.auth_id = ? 
and delete_yn ='N'
    `,
        auth_id
    );

export const webhookUpdate = async (data: webhookUpdateType) =>
    getConnection(async QUERY => {
        const { guild_id, user_id, type } = data;

        const ids = await userIds(user_id, QUERY);

        // 해당 길드의 사용자 알림을 모두 비활성화.
        await QUERY<SqlInsertUpdate>(
            `UPDATE event_channel SET delete_yn='Y', update_at=CURRENT_TIMESTAMP WHERE user_id in (?) AND guild_id = ? AND type = ? AND delete_yn='N'`,
            ids.map(v => v.user_id),
            guild_id,
            type
        );

        const inData = deleteObjectColByKey(data, 'user_id', 'type');
        // 해당 길드의 사용자 알림을 한개 생성 / 업데이트
        await QUERY<SqlInsertUpdate>(
            `
INSERT INTO event_channel (${Object.keys(inData)}, user_id, \`type\`)
select ${Object.entries(inData).map(([k, v]) => `${format('?', v)} AS ${k}`)}, a.user_id AS user_id, a.type AS \`type\`
from (
    select *
    from event_id e
    where e.type =14
    and user_id in (?)
) a
ON DUPLICATE KEY UPDATE ?, update_at=CURRENT_TIMESTAMP, delete_yn='N'
            `,
            ids.map(v => v.user_id),
            deleteObjectColByKey(inData, 'guild_id')
        );

        return QUERY<webhookType>(
            `
select ec.type, ec.user_id, ec.name as custom_name, ec.channel_id, ec.custom_ment, ec.hook_id, ec.hook_token
    , vat.user_id, vat.login, vat.name, vat.kr_name, vat.avatar, vat.avatar_id, ec.create_at, ec.update_at 
from event_channel ec
inner join v_auth_token vat  on vat.user_id  = ec.user_id and vat.type = 2
where ec.type = ?
and vat.auth_id = ? 
and guild_id = ?
and delete_yn ='N'
        `,
            type,
            user_id,
            guild_id
        ).then(v => v[0]); // 단건조회
    }, true);
