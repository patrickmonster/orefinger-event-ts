import { query } from 'utils/database';

export const selectLabel = async (names: string[], language_cd?: number) =>
    query<{
        name: string;
        language_cd: number;
        title: string;
        create_at: string;
        update_at: string;
    }>(
        `
SELECT
	name
	, language_cd
	, title
	, create_at
	, update_at
FROM sys_orefinger.label
WHERE 1=1
AND name IN (?)
AND language_cd = ?
        `,
        names,
        language_cd || 0 // KR
    );
