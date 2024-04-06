'use strict';
import { SqlInsertUpdate, YN, calTo, query } from 'utils/database';

import { APISelectMenuOption } from 'discord-api-types/v10';
import { AuthBord, AuthBordPK } from 'interfaces/authBord';

export const getQNAType = async (guildId: string) =>
    query<APISelectMenuOption>(
        `
SELECT
    json_object( 'name', IF( q.use_yn = 'Y', '🔴','⚫')) AS emoji
    ,  CAST(qt.qna_type AS CHAR) AS value
    , qt.name AS label
    , qt.description 
FROM qna_type qt 
left JOIN ( select * FROM qna q WHERE q.guild_id = ? ) q ON qt.qna_type = q.type
WHERE 1=1
AND qt.use_yn = 'Y' `,
        guildId
    );

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
    q.guild_id
    , q.\`type\`
    , q.embed_id
    , q.use_yn
    , q.create_at
    , q.update_at
    , ( SELECT name from qna_type qt WHERE q.type = qt.qna_type) as \`type\`
    , veu.embed 
FROM qna q 
LEFT JOIN v_embed_user veu ON q.embed_id  = veu.embed_id
WHERE 1=1
AND guild_id = ?
${calTo('and q.type = ?', type)}
    `,
        guild
    );

export const getAuthbordeList = async (guild: string, auth_type?: number | string) =>
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
