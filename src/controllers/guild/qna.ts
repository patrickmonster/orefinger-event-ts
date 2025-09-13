'use strict';
import { SqlInsertUpdate, YN, calTo, query } from 'utils/database';

import { APISelectMenuOption } from 'discord-api-types/v10';
import { QnaBord, QnaBordPK } from 'interfaces/qna';


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
