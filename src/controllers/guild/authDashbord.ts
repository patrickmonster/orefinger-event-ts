'use strict';
import { AuthUser } from 'interfaces/auth';
import getConnection, { SqlInsertUpdate, YN, calTo, query, queryFunctionType } from 'utils/database';

import { APIUser } from 'discord-api-types/v10';
import { Event } from 'interfaces/eventsub';
import { AuthBord, AuthBordPK } from 'interfaces/authBord';

// 인증 데시보드를 불러 옵니다.
export const getDashboard = async (guild: string, type?: number | string) =>
    query<{
        guild_id: string;
        type_id: number;
        type: string;
        role_id: string;
        embed: string;
        use_yn: YN;
        create_at: Date;
        update_at: Date;
    }>(
        `
select
    guild_id
    , ab.type as type_id
    , ( SELECT tag_kr from auth_type at2 WHERE ab.type = at2.auth_type) as \`type\`
    , role_id
    , func_get_embed(embed_id) as embed
    , use_yn
    , create_at
    , update_at
from
    auth_bord ab
WHERE ab.guild_id = ?
${calTo('and ab.type = ?', type)}
    `,
        guild,
        type
    );

export const getAuthbordeList = async (guild: string, auth_type?: number) =>
    query<{
        auth_type: number;
        tag: string;
        tag_kr: string;
        guild_id: string;
        type: number;
        role_id: string;
        embed_id: string;
        use_yn: YN;
        create_at: Date;
        update_at: Date;
    }>(
        `
SELECT
    at2.auth_type
    , at2.tag
    , at2.tag_kr
    , at2.use_yn
    , ab.guild_id
    , ab.\`type\`
    , ab.role_id
    , ab.embed_id
    , ab.use_yn
    , ab.create_at
    , ab.update_at
FROM auth_type at2
left JOIN ( select * from auth_bord ab WHERE ab.guild_id = ? ) ab ON at2.auth_type = ab.type
WHERE 1=1
AND at2.use_yn = 'Y'    
${calTo('and at2.auth_type = ?', auth_type)}
    `,
        guild
    );

export const upsertAuthBorde = async (bord: Partial<Omit<AuthBord, 'guild_id' | 'type'>>, pk: AuthBordPK) =>
    query<SqlInsertUpdate>(`INSERT INTO auth_bord SET ? ON DUPLICATE KEY UPDATE ?`, { ...bord, ...pk }, bord);
