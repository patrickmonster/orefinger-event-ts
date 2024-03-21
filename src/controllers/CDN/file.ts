import { SqlInsertUpdate, calTo, query, selectPaging } from 'utils/database';

import { Paging } from 'interfaces/swagger';

export const selectFileType = async () =>
    query<{ idx: number; name: string }>(`SELECT idx, name  FROM file_cdn_type fct WHERE use_yn='Y'`);

export const selectFile = async (paging: Paging, auth_id: string, target?: number) =>
    selectPaging<{
        idx: string;
        name: string;
        owenr: string;
        src: string;
        create_at: string;
        content_type: string;
    }>(
        `
SELECT
    fc.idx
    , fc.name
    , auth_id
    , src 
    , create_at
    , content_type
    , \`size\`
    , fct.name as type
FROM file_cdn fc
LEFT JOIN file_cdn_type fct ON fc.type = fct.idx
WHERE auth_id = ? 
AND fc.use_yn ='Y'
AND fct.use_yn ='Y'
${calTo('AND `type` = ?', target)}
ORDER BY create_at DESC
    `,
        paging,
        auth_id
    );

export type InsertFileType = {
    name: string;
    auth_id: string;
    src: string;
    size: number;
    content_type: string;
};
export const insertFile = async (file: InsertFileType) => query<SqlInsertUpdate>(`INSERT INTO file_cdn SET ?`, file);

export const deleteFile = async (idx: string, auth_id: string) =>
    query<SqlInsertUpdate>(`UPDATE file_cdn SET USE_YN='N' WHERE idx=? AND owenr=?`, idx, auth_id);
