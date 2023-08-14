'use strict';
import { query, queryPaging, SqlInsertUpdate, queryFunctionType } from 'utils/database';
import { AuthUser } from 'interfaces/auth';

import { Event } from 'interfaces/eventsub';

export const discord = async (profile: AuthUser, refreshToken: string) => auth('discord', profile.id, profile, refreshToken);

export const auth = async (type: string, auth_id: string, profile: AuthUser, refreshToken: string) => {
    const { id, username, discriminator, email, avatar } = profile;
    return query(`select func_auth_token(?) as user_type`, [type, '', id, auth_id, username, discriminator, email, avatar, refreshToken]);
};

export const userUpdate = async (event: Event) => {
    const { user_id, user_login, user_name, email } = event;
    await query<SqlInsertUpdate>(
        `
UPDATE auth_token SET 
?, update_at = CURRENT_TIMESTAMP 
WHERE \`type\` in (2,3) and user_id=?
        `,
        { login: user_login, name: user_name, email },
        user_id + ''
    );
};

/**
 * 사용자 ID들을 불러옴
 * @param QUERY
 * @param user_id
 * @returns
 */
export const userIds = async (QUERY: queryFunctionType, user_id: string) =>
    await QUERY<{
        user_id: string;
        type: number;
    }>(`
SELECT user_id 
	, \`type\` 
from v_auth_token vat 
where 1=1
and auth_id = '466950273928134666'
group by user_id
    `);

export const tokens = (user_id: string, ...types: number[]) =>
    query<{
        type: number;
        user_id: string;
        auth_id: string;
        login: string;
        name: string;
        user_type: number;
        email: string;
        avatar: string;
        refresh_token: string;
        is_session: string;
        create_at: string;
        update_at: string;
    }>(
        `
select vat.type
    , user_id
    , auth_id
    , login
    , name
    , user_type
    , email
    , avatar
    , refresh_token
    , is_session
    , create_at
    , update_at
from v_auth_token vat 
where auth_id = ?
and vat.type in (?)
group by user_id
`,
        user_id,
        types
    );

//
export const userAuthState = (id: string) =>
    query<{
        auth_id: string;
        create_at: string;
        tag: string;
        name: string;
    }>(
        ` -- 구독 or 인증정보를 불러옴
SELECT auth_id, ar.create_at, tag, g.name
FROM discord.auth_rule ar
inner join auth_rule_type art on ar.type =  art.idx 
join guild g using(guild_id)
where 1=1
and auth_id = ?
and g.name > ''`,
        id
    );
