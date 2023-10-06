import { query, SqlInsertUpdate, queryFunctionType, selectPaging } from 'utils/database';

import { Paging } from 'interfaces/swagger';

export const getFileList = async (paging: Paging, auth_id: string) =>
    selectPaging<{
        idx: string;
        name: string;
        owenr: string;
        src: string;
        create_at: string;
        content_type: string;
    }>(
        `
SELECT idx, name, owenr, src, create_at, content_type
FROM DISCORD.FILE_CDN
WHERE OWENR=?
AND USE_YN = 'Y'
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
