'use strict';
import { SqlInsertUpdate, YN, calTo, query } from 'utils/database';

import { QnaBord, QnaBordPK } from 'interfaces/qna';

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

export const upsertQnaBorde = async (bord: Partial<Omit<QnaBord, 'guild_id' | 'type'>>, pk: QnaBordPK) =>
    query<SqlInsertUpdate>(`INSERT INTO qna SET ? ON DUPLICATE KEY UPDATE ?`, { ...bord, ...pk }, bord);
