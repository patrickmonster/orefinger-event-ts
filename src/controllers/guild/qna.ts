'use strict';
import { SqlInsertUpdate, YN, calTo, query } from 'utils/database';

import { APISelectMenuOption } from 'discord-api-types/v10';
import { QnaBord, QnaBordPK } from 'interfaces/qna';

export const ParseInt = (id: string | number) => (typeof id == 'string' ? parseInt(id) : id);

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

export const getQnabordeList = async (guild: string, qna_type?: number | string) =>
    query<{
        qna_type: number;
        name: string;
        description: string;
        guild_id: string;
        embed_id: string;
        last_message: string;
        button: string;
        use_yn: YN;
        create_at: Date;
        update_at: Date;
    }>(
        `
SELECT
    qt.qna_type
    , qt.name
    , qt.description 
    , q.guild_id
    , q.embed_id
    , q.last_message
    , q.button
    , q.use_yn
    , q.create_at
    , q.update_at
FROM qna_type qt 
left JOIN ( select * from qna q WHERE q.guild_id = ? ) q ON q.type = qt.qna_type 
WHERE 1=1
AND qt.use_yn = 'Y'   
${calTo('and qt.qna_type = ?', qna_type)}
    `,
        guild
    );

export const upsertQnaBorde = async (bord: Partial<Omit<QnaBord, 'guild_id' | 'type'>>, pk: QnaBordPK) =>
    query<SqlInsertUpdate>(`INSERT INTO qna SET ? ON DUPLICATE KEY UPDATE ?`, { ...bord, ...pk }, bord);

export const selectQnaTypesByMenu = () =>
    query<APISelectMenuOption>(
        `
SELECT CAST(qt.qna_type AS CHAR) AS value
    , qt.name  AS label
    , LEFT(IFNULL(qt.description, null), 100) AS description
FROM qna_type qt
WHERE qt.use_yn = 'Y'
        `
    );

export const selectQnaTypes = (typeId?: number) =>
    query<{
        qna_type: number;
        create_at: Date;
        use_yn: YN;
        name: string;
        description: string;
        writer_yn: YN;
        reader_yn: YN;
        user_yn: YN;
    }>(
        `
SELECT
    qna_type
    , create_at
    , use_yn
    , name
    , description
    , writer_yn
    , reader_yn
    , user_yn
FROM qna_type qt
WHERE 1=1
${calTo('AND qna_type = ?', typeId)}
        `
    );
