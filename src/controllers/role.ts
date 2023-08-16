'use strict';
import getConnection, { query, queryPaging, SqlInsertUpdate, queryFunctionType } from 'utils/database';

const roleType = 52;

// 역할지급 로그
export const tusu = async (target_id: string, name: string, guild_id: string) =>
    await query<{
        user_id: string;
        channel_id: string | null | undefined;
        ment: string;
    }>(
        `
select 
	func_auth_rule(user_id, ?, 1) as user_id
	, token as channel_id
	, REPLACE(JSON_UNQUOTE(json_extract(\`data\`, '$.ment')), '{user}', ?) as ment
from event_id
where \`type\` = ${roleType} and user_id = ?
    `,
        target_id,
        name,
        guild_id
    );

export const createRoleEvent = async (guild_id: string, ment = '{user}님, 트수가 된걸 환영합니다! :kissing_heart:') =>
    query(
        `
INSERT INTO event_id set 
\`type\` = ${roleType}, user_id = ? , token = null, \`data\` = ?
on duplicate key update token = null`,
        guild_id,
        JSON.stringify({ ment })
    );
