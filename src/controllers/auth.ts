'use strict';
import { AuthUser } from 'interfaces/auth';
import { SqlInsertUpdate, calTo, query, queryFunctionType, selectPaging } from 'utils/database';

import { Event } from 'interfaces/eventsub';

export const discord = async (profile: AuthUser, refreshToken: string) => auth('discord', profile.id, profile, refreshToken);

export const auth = async (type: string, auth_id: string, profile: AuthUser, refreshToken: string, user_type?: string) => {
    const { id, username, discriminator, email, avatar } = profile;
    return query(`select func_auth_token(?) as user_type`, [
        type,
        user_type || '',
        id,
        auth_id,
        username,
        discriminator,
        email,
        avatar,
        refreshToken,
    ]);
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

export const userRefreshTokenUpdate = async (event: Event, ...types: number[]) => {
    const { user_id, refresh_token } = event;
    await query<SqlInsertUpdate>(
        `
UPDATE auth_token SET 
?, update_at = CURRENT_TIMESTAMP 
WHERE \`type\` in (?) and user_id=?
        `,
        { refresh_token },
        types,
        user_id + ''
    );
};

export const authTypes = async (isAll?: boolean) =>
    await query<{
        auth_type: number;
        tag: string;
        tag_kr: string;
        client_id: string;
        target: string;
        client_sc: string;
    }>(
        `
select auth_type, tag, tag_kr
${isAll ? '' : '-- '}, client_id , target , client_sc
from auth_type
WHERE 1=1
and use_yn ='Y'
        `
    );

export type deleteAuthConnectionAuthTypes =
    | 'discord'
    | 'twitch.stream'
    | 'twitch'
    | 'tiktok'
    | 'afreecatv'
    | 'kakao'
    | 'youtube'
    | 'toss'
    | 'toss.test';
export const deleteAuthConnection = async (type: deleteAuthConnectionAuthTypes, auth_id: string, user_id: string) =>
    await query<SqlInsertUpdate>(
        'DELETE FROM discord.auth_conntection  WHERE auth_id=? AND `type`=func_get_auth_type(?) AND user_id=?',
        auth_id,
        type,
        user_id
    );

/**
 * 사용자 ID들을 불러옴
 * @param QUERY
 * @param user_id
 * @returns
 */
export const userIds = async (user_id: string, QUERY?: queryFunctionType) =>
    await (QUERY ? QUERY : query)<{
        auth_type: number;
        tag: string;
        tag_kr: string;
        user_id: string;
        login: string;
        name: string;
        name_alias: string;
        avatar: string;
        is_session: boolean;
        create_at: string;
    }>(
        `
select 
    at2.auth_type
    , at2.tag 
    , at2.tag_kr 
    , at2.scope
    , at2.client_id
    , at2.target 
    , concat('client_id=', at2.client_id, if(at2.scope is not null, concat('&scope=', REPLACE(at2.scope, ',','%20')) , '')) as props
    , at3.user_id, at3.login, at3.name, at3.name_alias, at3.avatar, at3.is_session, at3.create_at 
from auth_type at2 
left join auth_conntection ac on at2.auth_type = ac.type and ac.auth_id = ?
left join auth_token at3 using(\`type\`, user_id) 
where 1=1
and use_yn ='Y'
    `,
        user_id
    );

export const tokens = (auth_id: string, ...types: number[]) =>
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
${calTo('AND vat.type in (?)', types)}
group by user_id
`,
        auth_id
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

export type GetAuthUsersSearchOption = {
    page: number;
    user_id?: string;
    auth_id?: string;
    login?: string;
    name?: string;
};
export const getAuthUsers = ({ page = 0, user_id = '', auth_id = '', login = '', name = '' }: GetAuthUsersSearchOption) =>
    selectPaging(
        `
select *
from v_auth_token vat 
where 1=1
${auth_id ? '' : '-- '}and auth_id = ?
${user_id ? '' : '-- '}and user_id = ?
${login ? '' : '-- '}and login = ?
${name ? '' : '-- '}and name = ?
    `,
        page,
        auth_id,
        user_id,
        login,
        name
    );
