'use strict';
import { AuthUser } from 'interfaces/auth';
import getConnection, {
    SqlInsertUpdate,
    YN,
    calTo,
    query,
    queryFunctionType,
    selectPaging,
    tastTo,
} from 'utils/database';

import { APIUser } from 'discord-api-types/v10';
import { Event } from 'interfaces/eventsub';
import { Paging } from 'interfaces/swagger';

export const discord = async (profile: AuthUser, refreshToken: string) =>
    auth('discord', profile.id, profile, refreshToken);

export const auth = async (
    type: string,
    auth_id: string,
    profile: AuthUser,
    refreshToken: string,
    user_type?: string
) => {
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

export const selectAuthType = async () =>
    query<{
        auth_type: number;
        tag: string;
        tag_kr: string;
        create_at: string;
        use_yn: string;
        scope: string;
        client_id: string;
        target: string;
        client_sc: string;
        logout_url: string;
    }>(`
SELECT auth_type, tag, tag_kr, create_at, use_yn, \`scope\`, client_id, target, client_sc, logout_url 
FROM auth_type at2 
WHERE 1=1
${tastTo("AND use_yn = 'Y'")}
    `);

export const userUpdate = async (event: Event) => {
    const { user_id, user_login, user_name } = event;
    const obj: Event = { login: user_login, name: user_name };
    if (event.avatar) obj.avatar = event.avatar;
    if (event.email) obj.email = event.email;
    await query<SqlInsertUpdate>(
        `
UPDATE auth_token SET 
?, update_at = CURRENT_TIMESTAMP 
WHERE \`type\` in (2,3) and user_id=?
        `,
        obj,
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

export const authTypes = async (isAll?: boolean, type?: number) =>
    await query<{
        auth_type: number;
        tag: string;
        tag_kr: string;
        target: string;
        scope: string;
        client_id: string;
        client_sc: string;
    }>(
        `
select auth_type, tag, tag_kr, scope
${isAll ? '' : '-- '}, client_id , target , client_sc
from auth_type
WHERE 1=1
${calTo('AND auth_type = ?', type)}
AND use_yn ='Y'
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
${tastTo("AND at2.use_yn = 'Y'")}
    `,
        user_id
    );

export const tokens = (auth_id: string, ...types: number[]) =>
    query<{
        type: number;
        type_kr: string;
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
	, ( SELECT tag FROM auth_type at2 WHERE at2.auth_type = vat.type) AS type_kr
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
    user_id?: string;
    auth_id?: string;
    login?: string;
    name?: string;
    type?: string;
};
export const selectAuthUsers = (page: Paging, { user_id, auth_id, login, name, type }: GetAuthUsersSearchOption) =>
    selectPaging<{
        type: number;
        tag: string;
        tag_kr: string;
        user_id: string;
        auth_id: string;
        login: string;
        name: string;
        kr_name: string;
        user_type: number;
        email: string;
        avatar: string;
        avatar_id: string;
        refresh_token: string;
        is_session: YN;
        create_at: string;
        update_at: string;
    }>(
        `    
SELECT
    vat.\`type\`
    , at2.tag 
    , at2.tag_kr 
    , vat.user_id
    , vat.auth_id
    , vat.login
    , vat.name
    , vat.kr_name
    , vat.user_type
    , vat.email
    , vat.avatar
    , vat.avatar_id
    , vat.refresh_token
    , vat.is_session
    , vat.create_at
    , vat.update_at
from v_auth_token vat
LEFT JOIN auth_type at2 ON vat.\`type\` = at2.auth_type 
where 1=1
${calTo('AND vat.type = ?', type)}
${calTo('AND vat.auth_id = ?', auth_id)}
${calTo('AND vat.user_id = ?', user_id)}
${calTo('AND vat.login = ?', login)}
${calTo('AND vat.name = ?', name)}
    `,
        page
    );

// 옵션에 대한 사용자 정보를 불러옴
export const getAuthBadge = (user_id: string) =>
    query<{
        user_id: string;
        auth_id: string;
        login: string;
        name: string;
        kr_name: string;
        user_type: string;
        avatar: string;
    }>(
        `
SELECT 
    vat.user_id
    , vat.auth_id
    , vat.login
    , vat.name
    , vat.kr_name
    , vat.user_type
    , vat.avatar
FROM auth_option ao
LEFT JOIN v_auth_token vat ON ao.auth_id = vat.auth_id  
WHERE badge = ?
AND vat.type = 2
AND vat.user_id = badge 
    `,
        user_id
    );

export const upsertDiscordUserAndJWTToken = async (user: APIUser) => {
    const { avatar, global_name, id, username } = user;

    const param = {
        name: global_name,
        username: username,
        tag: '0000',
        avatar,
    };

    return await getConnection(async query => {
        await query<SqlInsertUpdate>(
            'INSERT INTO auth SET ? ON DUPLICATE KEY UPDATE ?, update_at=CURRENT_TIMESTAMP',
            {
                ...param,
                auth_id: id,
            },
            param
        );

        return await query<{
            token: string;
        }>('SELECT func_auth_jwt(?) AS token', id).then(([{ token }]) => token);
    });
};

export const selectDiscordUserByJWTToken = async (token: string) =>
    query<{
        auth_id: string;
        hash: string;
        create_at: string;
    }>(
        `
SELECT auth_id, hash, create_at 
FROM auth_jwt aj 
WHERE hash = ?
AND CREATE_AT > DATE_ADD(CURRENT_TIMESTAMP, INTERVAL -1 DAY)
LIMIT 1;
`,
        token
    ).then(([user]) => user);

export const selectAuthbordList = async (guildId: string) =>
    query<{
        guild_id: string;
        type: number;
        role_id: string;
        embed_id: number;
        use_yn: 'Y' | 'N';
        create_at: string;
        update_at: string;
    }>(
        `
SELECT
	guild_id
	, type
	, role_id
	, embed_id
	, use_yn
	, create_at
	, update_at
FROM auth_bord ab
WHERE ab.guild_id = ?
    `,
        guildId
    );

export const upsertUserReport = async ({
    auth_id,
    user_id,
    ...user
}: {
    auth_id: string;
    user_id: string;
    use_yn?: 'Y' | 'N';
    commant: string;
}) =>
    query<SqlInsertUpdate>(
        `INSERT INTO auth_report SET ? ON DUPLICATE KEY UPDATE ?, update_at=CURRENT_TIMESTAMP`,
        {
            ...user,
            auth_id,
            user_id,
        },
        user
    );
