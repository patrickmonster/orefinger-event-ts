'use strict';
import { SqlInsertUpdate, YN, calTo, query } from 'utils/database';

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
SELECT
    ab.guild_id
    , ab.type as type_id
    , ( SELECT tag_kr from auth_type at2 WHERE ab.type = at2.auth_type) as \`type\`
    , ab.role_id
    , veu.embed 
    , ab.use_yn
    , ab.create_at
    , ab.update_at
FROM auth_bord ab
LEFT JOIN v_embed_user veu ON ab.embed_id  = veu.embed_id
WHERE 1=1
AND guild_id = ?
${calTo('and ab.type = ?', type)}
    `,
        guild
    );

export const getAuthbordeList = async (guild: string, auth_type?: number | string) =>
    query<{
        auth_type: number;
        tag: string;
        tag_kr: string;
        guild_id: string;
        nick_name: string;
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
    , ab.guild_id
    , ab.nick_name
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
