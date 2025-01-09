'use strict';
import { query } from 'utils/database';

export const rolePermission = async (showAll = false) =>
    query<{
        name: string;
        code: number;
        description: string;
    }>(
        `
SELECT name, code, description 
FROM permissions
WHERE 1=1
${showAll ? '' : "AND show_yn = 'Y'"}
        `
    );
