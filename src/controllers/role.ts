'use strict';
import getConnection, { SqlInsertUpdate, query, queryFunctionType } from 'utils/database';

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

export const insertAuthRule = async (auth_id: string, guild_id: string, type: number | string) =>
    getConnection(async (query: queryFunctionType) => {
        const [target] = await query<{
            auth_type: string;
            tag: string;
            tag_kr: string;
            guild_id: string;
            type: string;
            role_id: string;
            embed_id: string;
            use_yn: string;
            create_at: string;
            update_at: string;
        }>(
            `
SELECT
    at2.auth_type
    , at2.tag
    , at2.tag_kr
    , at2.use_yn
    , ab.guild_id
    , ab.type
    , ab.role_id
    , ab.embed_id
    , ab.use_yn
    , ab.create_at
    , ab.update_at
FROM auth_type at2
left JOIN ( select * from auth_bord ab WHERE ab.guild_id = ? ) ab ON at2.auth_type = ab.type
WHERE 1=1
AND at2.auth_type = ?
AND at2.use_yn = 'Y'
AND ab.use_yn = 'Y'
        `,
            guild_id,
            type
        );

        console.log('target', target);

        if (target && target.use_yn) {
            await query<SqlInsertUpdate>('INSERT IGNORE INTO auth_rule set ?', { auth_id, guild_id, type });

            return target;
        } else {
            throw new Error('NOT_FOUND');
        }
    });
